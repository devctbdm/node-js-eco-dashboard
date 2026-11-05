import { randomBytes } from 'node:crypto';
import { AuthenticationModule, google } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LogMailTransport, MailModule } from '@nestjs/mail';
import { SmtpTransport } from '@nestjs/mail';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PermissionPolicy } from './auth/permission.policy.js';
import { DatabaseModule } from './database/database.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { OrderPolicy } from './orders/order.policy.js';
import { ProductPolicy } from './products/product.policy.js';
import { UsersModule } from './users/users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
const configuredOrigins = process.env.CORS_ORIGIN;
export const trustedOrigins = (configuredOrigins ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const totpEncryptionKey = process.env.TOTP_ENCRYPTION_KEY;
const jwtSecret =
  process.env.JWT_SECRET ??
  (process.env.NODE_ENV === 'production'
    ? ''
    : randomBytes(32).toString('base64url'));

if (trustedOrigins.includes('*')) {
  throw new Error('CORS_ORIGIN must not allow every origin');
}
const appOrigin = new URL(appUrl).origin;
if (!trustedOrigins.includes(appOrigin)) {
  throw new Error('APP_URL must be included in CORS_ORIGIN');
}
if (
  process.env.NODE_ENV === 'production' &&
  (!configuredOrigins ||
    new URL(appUrl).protocol !== 'https:' ||
    trustedOrigins.some((origin) => new URL(origin).protocol !== 'https:'))
) {
  throw new Error('Production APP_URL and CORS_ORIGIN must use HTTPS');
}
if (process.env.NODE_ENV === 'production' && Buffer.byteLength(jwtSecret) < 32) {
  throw new Error('JWT_SECRET must be at least 32 bytes in production');
}

const mailTransport = () => {
  const host = process.env.SMTP_HOST;
  const from = process.env.MAIL_FROM;
  if (!host) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP_HOST and MAIL_FROM are required in production');
    }
    return new LogMailTransport({ body: false });
  }
  if (!from) {
    throw new Error('MAIL_FROM is required when SMTP_HOST is configured');
  }
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!!user !== !!pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be configured together');
  }
  const port = Number(process.env.SMTP_PORT ?? 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port');
  }
  return new SmtpTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    startTls: 'required',
    pool: true,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });
};

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    MailModule.forRoot({
      transport: mailTransport(),
      from: process.env.MAIL_FROM ?? 'Store <no-reply@localhost>',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    AuthenticationModule.forRoot({
      accessToken: {
        key: jwtSecret,
        issuer: 'https://api.example.com',
        audience: 'mobile-app',
        ttl: '15m',
      },
      emailVerification: { url: `${appUrl}/verify-email` },
      passwordReset: { url: `${appUrl}/reset-password` },
      ...(totpEncryptionKey && {
        mfa: {
          issuer: 'example.com',
          encryption: { keys: [totpEncryptionKey] },
        },
      }),
      ...(googleClientId &&
        googleClientSecret && {
          oidc: {
            callbackUrl: `${process.env.APP_URL ?? 'http://localhost:50001'}/auth/oidc/:provider/callback`,
            providers: {
              google: google({
                clientId: googleClientId,
                clientSecret: googleClientSecret,
              }),
            },
          },
        }),
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d',
        trustedOrigins,
        metadata: (request) => ({
          ...(request.ip ? { ip: request.ip } : {}),
          ...(request.headers['user-agent']
            ? { userAgent: request.headers['user-agent'] }
            : {}),
        }),
      },
    }),
    AuthorizationModule.forRoot({
      policies: [PermissionPolicy, OrderPolicy, ProductPolicy],
      imports: [OrdersModule],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
