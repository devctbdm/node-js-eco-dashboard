import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DATABASE = Symbol('DATABASE');
export const DATABASE_POOL = Symbol('DATABASE_POOL');
export type Database = NodePgDatabase;

@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool | null) {}

  async onApplicationShutdown() {
    await this.pool?.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString && process.env.NODE_ENV === 'production') {
          throw new Error('DATABASE_URL is required in production');
        }
        return connectionString
          ? new Pool({
              connectionString,
              max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
              connectionTimeoutMillis: 5_000,
              idleTimeoutMillis: 30_000,
            })
          : null;
      },
    },
    {
      provide: DATABASE,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool | null): Database | null =>
        pool ? drizzle({ client: pool }) : null,
    },
    DatabaseLifecycle,
  ],
  exports: [DATABASE, DATABASE_POOL],
})
export class DatabaseModule {}
