// The store's Drizzle tables. drizzle-kit generates the migrations from this file.
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const at = (name: string) =>
  timestamp(name, { withTimezone: true, mode: 'date' });

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    passwordHash: text('password_hash'),
    marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
    emailVerified: boolean('email_verified').notNull().default(false),
    status: text('status', {
      enum: ['active', 'suspended', 'blocked'],
    })
      .notNull()
      .default('active'),
    failedLoginCount: integer('failed_login_count').notNull().default(0),
    lastFailedLoginAt: at('last_failed_login_at'),
    lockedUntil: at('locked_until'),
    lastLoginAt: at('last_login_at'),
    createdAt: at('created_at').notNull().defaultNow(),
    updatedAt: at('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_status_idx').on(table.status),
  ],
);

export const roles = pgTable(
  'roles',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    description: text('description').notNull(),
    system: boolean('system').notNull().default(false),
    createdAt: at('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('roles_key_unique').on(table.key)],
);

export const permissions = pgTable(
  'permissions',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    description: text('description').notNull(),
  },
  (table) => [uniqueIndex('permissions_key_unique').on(table.key)],
);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index('user_roles_role_id_idx').on(table.roleId),
  ],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: text('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index('role_permissions_permission_id_idx').on(table.permissionId),
  ],
);

export const loginHistory = pgTable(
  'login_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    email: text('email').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    successful: boolean('successful').notNull(),
    suspicious: boolean('suspicious').notNull().default(false),
    occurredAt: at('occurred_at').notNull().defaultNow(),
  },
  (table) => [
    index('login_history_user_time_idx').on(table.userId, table.occurredAt),
    index('login_history_email_time_idx').on(table.email, table.occurredAt),
  ],
);

export const identities = pgTable(
  'identities',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    subject: text('subject').notNull(),
    createdAt: at('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('identities_provider_subject_unique').on(
      table.provider,
      table.subject,
    ),
    index('identities_user_id_idx').on(table.userId),
  ],
);

// Authentication state: what DrizzleAuthenticationStore (src/auth) keeps for @nestjs/authentication.
// Tokens, links and sessions are stored by their SHA-256; TOTP secrets arrive encrypted.

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: at('created_at').notNull(),
    expiresAt: at('expires_at').notNull(),
    lastActiveAt: at('last_active_at').notNull(),
    mfa: text('mfa', { enum: ['pending', 'verified'] }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: text('id').primaryKey(),
    familyId: text('family_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: at('created_at').notNull(),
    expiresAt: at('expires_at').notNull(),
    familyExpiresAt: at('family_expires_at').notNull(),
    usedAt: at('used_at'),
    // A family is revoked when any of its tokens is: that covers a successor saved after the revocation.
    revoked: boolean('revoked').notNull().default(false),
    claims: jsonb('claims').$type<Record<string, unknown>>(),
  },
  (table) => [
    index('refresh_tokens_family_id_idx').on(table.familyId),
    index('refresh_tokens_user_id_idx').on(table.userId),
    index('refresh_tokens_family_expires_at_idx').on(table.familyExpiresAt),
  ],
);

export const revokedRefreshTokenFamilies = pgTable(
  'revoked_refresh_token_families',
  {
    familyId: text('family_id').primaryKey(),
    revokedAt: at('revoked_at').notNull(),
  },
);

export const mfaAuthenticators = pgTable('mfa_authenticators', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(),
  confirmed: boolean('confirmed').notNull(),
  pendingSecret: text('pending_secret'),
  lastUsedStep: integer('last_used_step'),
});

export const mfaRecoveryCodes = pgTable(
  'mfa_recovery_codes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.codeHash] })],
);

export const mfaFailures = pgTable(
  'mfa_failures',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    failedAt: at('failed_at').notNull(),
  },
  (table) => [
    index('mfa_failures_user_id_failed_at_idx').on(
      table.userId,
      table.failedAt,
    ),
    index('mfa_failures_failed_at_idx').on(table.failedAt),
  ],
);

export const magicLinks = pgTable(
  'magic_links',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    createdAt: at('created_at').notNull(),
    expiresAt: at('expires_at').notNull(),
    redirectTo: text('redirect_to'),
  },
  (table) => [index('magic_links_expires_at_idx').on(table.expiresAt)],
);

export const oidcLogins = pgTable(
  'oidc_logins',
  {
    state: text('state').primaryKey(),
    provider: text('provider').notNull(),
    codeVerifier: text('code_verifier').notNull(),
    nonce: text('nonce'),
    redirectTo: text('redirect_to'),
    // Set for "connect your Google account" from a signed-in session.
    linkUserId: text('link_user_id'),
    linkSessionId: text('link_session_id'),
    createdAt: at('created_at').notNull(),
    expiresAt: at('expires_at').notNull(),
  },
  (table) => [index('oidc_logins_expires_at_idx').on(table.expiresAt)],
);

export const emailTokens = pgTable(
  'email_tokens',
  {
    id: text('id').primaryKey(),
    purpose: text('purpose', {
      enum: ['password-reset', 'email-verification'],
    }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    fingerprint: text('fingerprint'),
    createdAt: at('created_at').notNull(),
    expiresAt: at('expires_at').notNull(),
  },
  (table) => [
    index('email_tokens_user_id_purpose_idx').on(table.userId, table.purpose),
    index('email_tokens_expires_at_idx').on(table.expiresAt),
  ],
);
