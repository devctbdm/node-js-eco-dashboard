import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

const envFile = join(dirname(fileURLToPath(import.meta.url)), '.env');
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/store',
  },
});
