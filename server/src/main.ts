import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

const envFile = join(dirname(fileURLToPath(import.meta.url)), '../.env');
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

const { AppModule, ObserveInstrument, trustedOrigins } =
  await import('./app.module.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
  });
  app.enableCsrfProtection({ trustedOrigins });
  app.useSecurityHeaders();
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 5000);
}
await bootstrap();
