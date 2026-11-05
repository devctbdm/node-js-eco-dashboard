import { Module } from '@nestjs/common';
import { PostgresAuthenticationStore } from '../database/postgres-authentication.store.js';
import { UsersModule } from '../users/users.module.js';
import { AccountLinker } from './account-linker.js';
import { AccountController } from './account.controller.js';
import { AdminAccessController } from './admin-access.controller.js';
import { AdminSetupController } from './admin-setup.controller.js';
import { AuthController } from './auth.controller.js';
import { CredentialsService } from './credentials.service.js';
import { EmailVerificationController } from './email-verification.controller.js';
import { EmailVerificationMailer } from './email-verification.mailer.js';
import { JwtAuth } from './jwt-auth.provider.js';
import { PasswordResetController } from './password-reset.controller.js';
import { PasswordResetMailer } from './password-reset.mailer.js';
import { RbacService } from './rbac.service.js';
import { SessionAuth } from './session-auth.provider.js';
import { TokensController } from './tokens.controller.js';

@Module({
  imports: [UsersModule],
  controllers: [
    AuthController,
    AccountController,
    AdminSetupController,
    AdminAccessController,
    EmailVerificationController,
    PasswordResetController,
    TokensController,
  ],
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [AccountLinker]
      : []),
    SessionAuth,
    CredentialsService,
    PostgresAuthenticationStore,
    RbacService,
    EmailVerificationMailer,
    PasswordResetMailer,
    JwtAuth,
  ],
})
export class AuthModule {}
