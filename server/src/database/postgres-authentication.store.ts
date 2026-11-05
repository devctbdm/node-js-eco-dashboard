import {
  AuthenticationStorage,
  type EmailTokenPurpose,
  type EmailTokenRecord,
  type EmailTokenStore,
  type MagicLinkRecord,
  type MagicLinkStore,
  type MfaStore,
  type OidcStateStore,
  type OidcTransaction,
  type RefreshTokenRecord,
  type RefreshTokenStore,
  type SessionRecord,
  type SessionStore,
  type TotpRecord,
} from '@nestjs/authentication';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE, type Database } from './database.module.js';

type Row = Record<string, unknown>;

const first = async <T extends Row>(
  db: Database,
  statement: ReturnType<typeof sql>,
): Promise<T | undefined> => {
  const result = await db.execute<T>(statement, 'objects');
  return result[0];
};

const date = (value: unknown) =>
  value instanceof Date ? value : new Date(String(value));

const optionalDate = (value: unknown) =>
  value == null ? undefined : date(value);

const objectValue = (value: unknown) =>
  value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;

const sessionFromRow = (row: Row): SessionRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  createdAt: date(row.created_at),
  expiresAt: date(row.expires_at),
  lastActiveAt: date(row.last_active_at),
  ...(row.mfa === 'pending' || row.mfa === 'verified'
    ? { mfa: row.mfa }
    : {}),
  ...(objectValue(row.metadata) ? { metadata: objectValue(row.metadata) } : {}),
});

const refreshTokenFromRow = (row: Row): RefreshTokenRecord => ({
  id: String(row.id),
  familyId: String(row.family_id),
  userId: String(row.user_id),
  createdAt: date(row.created_at),
  expiresAt: date(row.expires_at),
  familyExpiresAt: date(row.family_expires_at),
  ...(optionalDate(row.used_at) ? { usedAt: date(row.used_at) } : {}),
  ...(objectValue(row.claims) ? { claims: objectValue(row.claims) } : {}),
});

const emailTokenFromRow = (row: Row): EmailTokenRecord => ({
  id: String(row.id),
  purpose: row.purpose as EmailTokenPurpose,
  userId: String(row.user_id),
  email: String(row.email),
  ...(typeof row.fingerprint === 'string'
    ? { fingerprint: row.fingerprint }
    : {}),
  createdAt: date(row.created_at),
  expiresAt: date(row.expires_at),
});

const magicLinkFromRow = (row: Row): MagicLinkRecord => ({
  id: String(row.id),
  email: String(row.email),
  createdAt: date(row.created_at),
  expiresAt: date(row.expires_at),
  ...(typeof row.redirect_to === 'string'
    ? { redirectTo: row.redirect_to }
    : {}),
});

const oidcFromRow = (row: Row): OidcTransaction => ({
  state: String(row.state),
  provider: String(row.provider),
  codeVerifier: String(row.code_verifier),
  ...(typeof row.nonce === 'string' ? { nonce: row.nonce } : {}),
  ...(typeof row.redirect_to === 'string'
    ? { redirectTo: row.redirect_to }
    : {}),
  ...(typeof row.link_user_id === 'string' &&
  typeof row.link_session_id === 'string'
    ? {
        link: {
          userId: row.link_user_id,
          sessionId: row.link_session_id,
        },
      }
    : {}),
  createdAt: date(row.created_at),
  expiresAt: date(row.expires_at),
});

@Injectable()
export class PostgresAuthenticationStore
  implements
    SessionStore,
    RefreshTokenStore,
    MfaStore,
    MagicLinkStore,
    OidcStateStore,
    EmailTokenStore
{
  constructor(
    @Optional() @Inject(DATABASE) private readonly db: Database | null,
    storage: AuthenticationStorage,
  ) {
    if (db) {
      storage.registerSource({
        sessions: this,
        refreshTokens: this,
        mfa: this,
        magicLinks: this,
        oidcStates: this,
        emailTokens: this,
      });
    }
  }

  private get database(): Database {
    if (!this.db) {
      throw new Error('PostgreSQL is not configured');
    }
    return this.db;
  }

  async getSession(id: string) {
    const row = await first<Row>(
      this.database,
      sql`SELECT * FROM sessions WHERE id = ${id}`,
    );
    return row ? sessionFromRow(row) : undefined;
  }

  async createSession(record: SessionRecord) {
    await this.database.execute(sql`
      INSERT INTO sessions
        (id, user_id, created_at, expires_at, last_active_at, mfa, metadata)
      VALUES
        (${record.id}, ${record.userId}, ${record.createdAt}, ${record.expiresAt},
         ${record.lastActiveAt}, ${record.mfa ?? null}, ${record.metadata ?? null})
    `);
    await this.database.execute(
      sql`DELETE FROM sessions WHERE expires_at <= ${record.createdAt}`,
    );
  }

  async touchSession(id: string, lastActiveAt: Date) {
    await this.database.execute(sql`
      UPDATE sessions
      SET last_active_at = ${lastActiveAt}
      WHERE id = ${id} AND last_active_at < ${lastActiveAt}
    `);
  }

  async deleteSession(id: string) {
    const result = await this.database.execute<{ id: string }>(sql`
      DELETE FROM sessions WHERE id = ${id} RETURNING id
    `, 'objects');
    return result.length > 0;
  }

  async listUserSessions(userId: string) {
    const result = await this.database.execute<Row>(sql`
      SELECT * FROM sessions WHERE user_id = ${userId}
    `, 'objects');
    return result.map(sessionFromRow);
  }

  async deleteUserSessions(userId: string) {
    await this.database.execute(
      sql`DELETE FROM sessions WHERE user_id = ${userId}`,
    );
  }

  async getRefreshToken(id: string) {
    const row = await first<Row>(
      this.database,
      sql`SELECT * FROM refresh_tokens WHERE id = ${id}`,
    );
    return row ? refreshTokenFromRow(row) : undefined;
  }

  async saveRefreshToken(record: RefreshTokenRecord) {
    await this.database.execute(sql`
      INSERT INTO refresh_tokens
        (id, family_id, user_id, created_at, expires_at, family_expires_at,
         used_at, revoked, claims)
      VALUES
        (${record.id}, ${record.familyId}, ${record.userId}, ${record.createdAt},
         ${record.expiresAt}, ${record.familyExpiresAt}, ${record.usedAt ?? null},
         false, ${record.claims ?? null})
    `);
    await this.database.execute(sql`
      DELETE FROM refresh_tokens WHERE family_expires_at <= ${record.createdAt}
    `);
  }

  async markRefreshTokenUsed(id: string, at: Date) {
    const result = await this.database.execute<{ id: string }>(sql`
      UPDATE refresh_tokens SET used_at = ${at}
      WHERE id = ${id} AND used_at IS NULL AND revoked = false
      RETURNING id
    `, 'objects');
    return result.length > 0;
  }

  async revokeRefreshTokenFamily(familyId: string) {
    await this.database.transaction(async (tx) => {
      await tx.execute(sql`
        INSERT INTO revoked_refresh_token_families (family_id, revoked_at)
        VALUES (${familyId}, ${new Date()})
        ON CONFLICT (family_id) DO NOTHING
      `);
      await tx.execute(sql`
        UPDATE refresh_tokens SET revoked = true WHERE family_id = ${familyId}
      `);
    });
  }

  async isRefreshTokenFamilyRevoked(familyId: string) {
    const row = await first<Row>(
      this.database,
      sql`SELECT family_id FROM revoked_refresh_token_families WHERE family_id = ${familyId}`,
    );
    return !!row;
  }

  async revokeUserRefreshTokens(userId: string) {
    await this.database.transaction(async (tx) => {
      await tx.execute(sql`
        INSERT INTO revoked_refresh_token_families (family_id, revoked_at)
        SELECT DISTINCT family_id, ${new Date()}
        FROM refresh_tokens
        WHERE user_id = ${userId}
        ON CONFLICT (family_id) DO NOTHING
      `);
      await tx.execute(sql`
        UPDATE refresh_tokens SET revoked = true WHERE user_id = ${userId}
      `);
    });
  }

  async getTotp(userId: string): Promise<TotpRecord | undefined> {
    const row = await first<Row>(
      this.database,
      sql`SELECT secret, confirmed, pending_secret, last_used_step
          FROM mfa_authenticators WHERE user_id = ${userId}`,
    );
    return row
      ? {
          secret: String(row.secret),
          confirmed: Boolean(row.confirmed),
          ...(typeof row.pending_secret === 'string'
            ? { pendingSecret: row.pending_secret }
            : {}),
          ...(typeof row.last_used_step === 'number'
            ? { lastUsedStep: row.last_used_step }
            : {}),
        }
      : undefined;
  }

  async saveTotp(userId: string, record: TotpRecord | null) {
    if (!record) {
      await this.database.execute(
        sql`DELETE FROM mfa_authenticators WHERE user_id = ${userId}`,
      );
      return;
    }
    await this.database.execute(sql`
      INSERT INTO mfa_authenticators
        (user_id, secret, confirmed, pending_secret, last_used_step)
      VALUES
        (${userId}, ${record.secret}, ${record.confirmed},
         ${record.pendingSecret ?? null}, ${record.lastUsedStep ?? null})
      ON CONFLICT (user_id) DO UPDATE SET
        secret = EXCLUDED.secret,
        confirmed = EXCLUDED.confirmed,
        pending_secret = EXCLUDED.pending_secret,
        last_used_step = GREATEST(
          mfa_authenticators.last_used_step,
          EXCLUDED.last_used_step
        )
    `);
  }

  async claimTotpStep(userId: string, step: number) {
    const result = await this.database.execute<{ user_id: string }>(sql`
      UPDATE mfa_authenticators SET last_used_step = ${step}
      WHERE user_id = ${userId}
        AND (last_used_step IS NULL OR last_used_step < ${step})
      RETURNING user_id
    `, 'objects');
    return result.length > 0;
  }

  async saveRecoveryCodes(userId: string, hashes: string[]) {
    await this.database.transaction(async (tx) => {
      await tx.execute(
        sql`DELETE FROM mfa_recovery_codes WHERE user_id = ${userId}`,
      );
      for (const hash of hashes) {
        await tx.execute(sql`
          INSERT INTO mfa_recovery_codes (user_id, code_hash)
          VALUES (${userId}, ${hash})
        `);
      }
    });
  }

  async consumeRecoveryCode(userId: string, hash: string) {
    const result = await this.database.execute<{ user_id: string }>(sql`
      DELETE FROM mfa_recovery_codes
      WHERE user_id = ${userId} AND code_hash = ${hash}
      RETURNING user_id
    `, 'objects');
    return result.length > 0;
  }

  async countRecoveryCodes(userId: string) {
    const row = await first<{ count: string }>(
      this.database,
      sql`SELECT count(*)::text AS count FROM mfa_recovery_codes WHERE user_id = ${userId}`,
    );
    return Number(row?.count ?? 0);
  }

  async recordMfaFailure(userId: string, windowMs: number, now: number) {
    await this.database.execute(sql`
      INSERT INTO mfa_failures (user_id, failed_at)
      VALUES (${userId}, ${new Date(now)})
    `);
    await this.database.execute(sql`
      DELETE FROM mfa_failures
      WHERE user_id = ${userId}
        AND failed_at <= ${new Date(now - windowMs)}
    `);
    return this.countMfaFailures(userId, windowMs, now);
  }

  async countMfaFailures(userId: string, windowMs: number, now: number) {
    const row = await first<{ count: string }>(
      this.database,
      sql`SELECT count(*)::text AS count FROM mfa_failures
          WHERE user_id = ${userId}
            AND failed_at > ${new Date(now - windowMs)}
            AND failed_at <= ${new Date(now)}`,
    );
    return Number(row?.count ?? 0);
  }

  async clearMfaFailures(userId: string) {
    await this.database.execute(
      sql`DELETE FROM mfa_failures WHERE user_id = ${userId}`,
    );
  }

  async saveMagicLink(record: MagicLinkRecord) {
    await this.database.execute(sql`
      INSERT INTO magic_links (id, email, created_at, expires_at, redirect_to)
      VALUES
        (${record.id}, ${record.email}, ${record.createdAt}, ${record.expiresAt},
         ${record.redirectTo ?? null})
    `);
    await this.database.execute(
      sql`DELETE FROM magic_links WHERE expires_at <= ${record.createdAt}`,
    );
    await this.database.execute(sql`
      DELETE FROM magic_links
      WHERE id IN (
        SELECT id FROM magic_links
        ORDER BY expires_at DESC
        OFFSET 10000
      )
    `);
  }

  async consumeMagicLink(id: string) {
    const row = await first<Row>(
      this.database,
      sql`DELETE FROM magic_links WHERE id = ${id} RETURNING *`,
    );
    return row ? magicLinkFromRow(row) : undefined;
  }

  async saveOidcState(transaction: OidcTransaction) {
    await this.database.execute(sql`
      INSERT INTO oidc_logins
        (state, provider, code_verifier, nonce, redirect_to, link_user_id,
         link_session_id, created_at, expires_at)
      VALUES
        (${transaction.state}, ${transaction.provider}, ${transaction.codeVerifier},
         ${transaction.nonce ?? null}, ${transaction.redirectTo ?? null},
         ${transaction.link?.userId ?? null}, ${transaction.link?.sessionId ?? null},
         ${transaction.createdAt}, ${transaction.expiresAt})
    `);
    await this.database.execute(
      sql`DELETE FROM oidc_logins WHERE expires_at <= ${transaction.createdAt}`,
    );
    await this.database.execute(sql`
      DELETE FROM oidc_logins
      WHERE state IN (
        SELECT state FROM oidc_logins
        ORDER BY expires_at DESC
        OFFSET 10000
      )
    `);
  }

  async consumeOidcState(state: string) {
    const row = await first<Row>(
      this.database,
      sql`DELETE FROM oidc_logins WHERE state = ${state} RETURNING *`,
    );
    return row ? oidcFromRow(row) : undefined;
  }

  async saveEmailToken(record: EmailTokenRecord) {
    await this.database.execute(sql`
      INSERT INTO email_tokens
        (id, purpose, user_id, email, fingerprint, created_at, expires_at)
      VALUES
        (${record.id}, ${record.purpose}, ${record.userId}, ${record.email},
         ${record.fingerprint ?? null}, ${record.createdAt}, ${record.expiresAt})
    `);
    await this.database.execute(sql`
      DELETE FROM email_tokens WHERE expires_at <= ${record.createdAt}
    `);
    await this.database.execute(sql`
      DELETE FROM email_tokens
      WHERE id IN (
        SELECT id FROM email_tokens
        WHERE user_id = ${record.userId} AND purpose = ${record.purpose}
        ORDER BY expires_at DESC
        OFFSET 10
      )
    `);
  }

  async consumeEmailToken(id: string, purpose: EmailTokenPurpose) {
    const row = await first<Row>(
      this.database,
      sql`DELETE FROM email_tokens
          WHERE id = ${id} AND purpose = ${purpose}
          RETURNING *`,
    );
    return row ? emailTokenFromRow(row) : undefined;
  }

  async deleteUserEmailTokens(userId: string, purpose: EmailTokenPurpose) {
    await this.database.execute(sql`
      DELETE FROM email_tokens
      WHERE user_id = ${userId} AND purpose = ${purpose}
    `);
  }
}
