import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DATABASE, type Database } from '../database/database.module.js';
import type { AccountStatus, Role, User } from './user.js';

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  marketing_opt_in: boolean;
  status: AccountStatus;
  roles: string[] | null;
  permissions: string[] | null;
  password_hash?: string | null;
  locked_until?: Date | null;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string | null;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  successful: boolean;
  suspicious: boolean;
  occurredAt: Date;
}

interface MemoryUser extends User {
  passwordHash: string | null;
  failedLoginCount: number;
  lastFailedLoginAt: Date | null;
  lockedUntil: Date | null;
}

const USER_SELECT = sql`
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.email_verified,
    u.marketing_opt_in,
    u.status,
    u.password_hash,
    u.locked_until,
    COALESCE(array_agg(DISTINCT r.key) FILTER (WHERE r.key IS NOT NULL), '{}') AS roles,
    COALESCE(array_agg(DISTINCT p.key) FILTER (WHERE p.key IS NOT NULL), '{}') AS permissions
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
`;

const normalize = (email: string) =>
  email.trim().normalize('NFC').toLowerCase();

const identityKey = (provider: string, subject: string) =>
  JSON.stringify([provider, subject]);

const fromRow = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  marketingOptIn: row.marketing_opt_in,
  emailVerified: row.email_verified,
  status: row.status,
  roles: (row.roles ?? []) as Role[],
  permissions: row.permissions ?? [],
});

const isUniqueViolation = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23505';

@Injectable()
export class UsersRepository {
  private readonly rows = new Map<string, MemoryUser>();
  private readonly identities = new Map<string, string>();
  private readonly history: LoginHistoryEntry[] = [];

  constructor(
    @Optional() @Inject(DATABASE) private readonly db: Database | null,
  ) {}

  async create(
    email: string,
    {
      passwordHash = null,
      emailVerified = false,
      fullName = '',
      marketingOptIn = false,
      role = 'customer',
    }: {
      passwordHash?: string | null;
      emailVerified?: boolean;
      fullName?: string;
      marketingOptIn?: boolean;
      role?: Role;
    } = {},
  ): Promise<User> {
    const normalizedEmail = normalize(email);
    if (await this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email already registered');
    }

    if (this.db) {
      const id = randomUUID();
      try {
        await this.db.transaction(async (tx) => {
          await tx.execute(sql`
            INSERT INTO users
              (id, email, full_name, password_hash, email_verified,
               marketing_opt_in, status)
            VALUES
              (${id}, ${normalizedEmail}, ${fullName.trim()}, ${passwordHash},
               ${emailVerified}, ${marketingOptIn}, 'active')
          `);
          await tx.execute(sql`
            INSERT INTO user_roles (user_id, role_id)
            SELECT ${id}, id FROM roles WHERE key = ${role}
            ON CONFLICT DO NOTHING
          `);
        });
        const user = await this.findById(id);
        if (!user) {
          throw new Error('New user could not be loaded');
        }
        return user;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictException('Email already registered');
        }
        throw error;
      }
    }

    const row: MemoryUser = {
      id: randomUUID(),
      email: normalizedEmail,
      fullName: fullName.trim(),
      marketingOptIn,
      emailVerified,
      roles: [role],
      permissions: [...(memoryRolePermissions[role] ?? [])],
      status: 'active',
      passwordHash,
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
    };
    this.rows.set(row.id, row);
    return publicUser(row);
  }

  async hasSuperAdmin(): Promise<boolean> {
    if (!this.db) {
      return [...this.rows.values()].some((user) =>
        user.roles.includes('superadmin'),
      );
    }
    const result = await this.db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE r.key = 'superadmin'
      ) AS exists
    `);
    return result.rows[0]?.exists ?? false;
  }

  async createInitialSuperAdmin(
    email: string,
    passwordHash: string,
    fullName: string,
  ): Promise<User> {
    if (!this.db) {
      if (await this.hasSuperAdmin()) {
        throw new ConflictException('Initial administrator already exists');
      }
      return this.create(email, {
        passwordHash,
        fullName,
        emailVerified: true,
        role: 'superadmin',
      });
    }

    const normalizedEmail = normalize(email);
    const id = randomUUID();
    try {
      await this.db.transaction(async (tx) => {
        await tx.execute(sql`
          SELECT pg_advisory_xact_lock(hashtext('fullstack:initial-superadmin'))
        `);
        const existing = await tx.execute<{ exists: boolean }>(sql`
          SELECT EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            WHERE r.key = 'superadmin'
          ) AS exists
        `);
        if (existing.rows[0]?.exists) {
          throw new ConflictException('Initial administrator already exists');
        }
        await tx.execute(sql`
          INSERT INTO users
            (id, email, full_name, password_hash, email_verified, status)
          VALUES
            (${id}, ${normalizedEmail}, ${fullName.trim()}, ${passwordHash},
             true, 'active')
        `);
        await tx.execute(sql`
          INSERT INTO user_roles (user_id, role_id)
          SELECT ${id}, id FROM roles WHERE key = 'superadmin'
        `);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Initial administrator could not be loaded');
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    if (!this.db) {
      const row = this.rows.get(id);
      return row ? publicUser(row) : null;
    }
    return this.findUser(sql`${USER_SELECT} WHERE u.id = ${id} GROUP BY u.id`);
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = normalize(email);
    if (!this.db) {
      const row = [...this.rows.values()].find(
        (candidate) => candidate.email === normalizedEmail,
      );
      return row ? publicUser(row) : null;
    }
    return this.findUser(
      sql`${USER_SELECT} WHERE u.email = ${normalizedEmail} GROUP BY u.id`,
    );
  }

  async findByIdentity(provider: string, subject: string): Promise<User | null> {
    if (!this.db) {
      const userId = this.identities.get(identityKey(provider, subject));
      return userId ? this.findById(userId) : null;
    }
    return this.findUser(sql`
      ${USER_SELECT}
      INNER JOIN identities i ON i.user_id = u.id
      WHERE i.provider = ${provider} AND i.subject = ${subject}
      GROUP BY u.id
    `);
  }

  async linkIdentity(
    userId: string,
    provider: string,
    subject: string,
  ): Promise<User | null> {
    if (!this.db) {
      const key = identityKey(provider, subject);
      const existingUserId = this.identities.get(key);
      if (existingUserId && existingUserId !== userId) {
        throw new ConflictException('This identity belongs to another customer');
      }
      if (!this.rows.has(userId)) {
        return null;
      }
      this.identities.set(key, userId);
      return this.findById(userId);
    }

    try {
      await this.db.execute(sql`
        INSERT INTO identities (id, user_id, provider, subject)
        VALUES (${randomUUID()}, ${userId}, ${provider}, ${subject})
        ON CONFLICT (provider, subject) DO NOTHING
      `);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('This identity belongs to another customer');
      }
      throw error;
    }
    const user = await this.findByIdentity(provider, subject);
    if (user?.id !== userId) {
      throw new ConflictException('This identity belongs to another customer');
    }
    return user;
  }

  async findCredentials(
    email: string,
  ): Promise<{ user: User; passwordHash: string | null; lockedUntil: Date | null } | null> {
    const normalizedEmail = normalize(email);
    if (!this.db) {
      const row = [...this.rows.values()].find(
        (candidate) => candidate.email === normalizedEmail,
      );
      return row
        ? {
            user: publicUser(row),
            passwordHash: row.passwordHash,
            lockedUntil: row.lockedUntil,
          }
        : null;
    }

    const result = await this.db.execute<UserRow>(sql`
      ${USER_SELECT}
      WHERE u.email = ${normalizedEmail}
      GROUP BY u.id
    `);
    const row = result.rows[0];
    return row
      ? {
          user: fromRow(row),
          passwordHash: row.password_hash ?? null,
          lockedUntil: row.locked_until ?? null,
        }
      : null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    if (!this.db) {
      const row = this.rows.get(id);
      if (row) row.passwordHash = passwordHash;
      return;
    }
    await this.db.execute(sql`
      UPDATE users SET password_hash = ${passwordHash}, updated_at = now()
      WHERE id = ${id}
    `);
  }

  async updateEmail(id: string, email: string): Promise<User | null> {
    const normalizedEmail = normalize(email);
    if (await this.findByEmail(normalizedEmail)) {
      const existing = await this.findByEmail(normalizedEmail);
      if (existing?.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }
    if (!this.db) {
      const row = this.rows.get(id);
      if (!row) return null;
      row.email = normalizedEmail;
      row.emailVerified = false;
      return publicUser(row);
    }
    try {
      const result = await this.db.execute<{ id: string }>(sql`
        UPDATE users
        SET email = ${normalizedEmail}, email_verified = false, updated_at = now()
        WHERE id = ${id}
        RETURNING id
      `);
      return result.rows[0] ? this.findById(id) : null;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async markEmailVerified(id: string, email: string): Promise<boolean> {
    const normalizedEmail = normalize(email);
    if (!this.db) {
      const row = this.rows.get(id);
      if (!row || row.email !== normalizedEmail) return false;
      row.emailVerified = true;
      return true;
    }
    const result = await this.db.execute<{ id: string }>(sql`
      UPDATE users SET email_verified = true, updated_at = now()
      WHERE id = ${id} AND email = ${normalizedEmail}
      RETURNING id
    `);
    return result.rows.length > 0;
  }

  async recordLoginAttempt({
    email,
    user,
    ipAddress,
    userAgent,
    successful,
  }: {
    email: string;
    user: User | null;
    ipAddress?: string;
    userAgent?: string;
    successful: boolean;
  }) {
    const normalizedEmail = normalize(email);
    const currentTime = new Date();
    let suspicious = false;
    let targetUserId = user?.id ?? null;

    if (this.db) {
      if (!targetUserId && !successful) {
        const account = await this.db.execute<{ id: string }>(sql`
          SELECT id FROM users WHERE email = ${normalizedEmail}
        `);
        targetUserId = account.rows[0]?.id ?? null;
      }
      if (successful && user) {
        const previous = await this.db.execute<{ ip_address: string | null }>(
          sql`SELECT ip_address FROM login_history
              WHERE user_id = ${user.id} AND successful = true
              ORDER BY occurred_at DESC LIMIT 1`,
        );
        const previousIp = previous.rows[0]?.ip_address;
        suspicious = !!previousIp && !!ipAddress && previousIp !== ipAddress;
        await this.db.execute(sql`
          UPDATE users SET
            failed_login_count = 0,
            last_failed_login_at = null,
            locked_until = null,
            last_login_at = ${currentTime},
            updated_at = ${currentTime}
          WHERE id = ${user.id}
        `);
      } else if (targetUserId) {
        await this.db.execute(sql`
          UPDATE users SET
            failed_login_count = CASE
              WHEN last_failed_login_at IS NULL
                OR last_failed_login_at <= ${new Date(currentTime.getTime() - 15 * 60_000)}
              THEN 1 ELSE failed_login_count + 1
            END,
            locked_until = CASE
              WHEN (CASE
                WHEN last_failed_login_at IS NULL
                  OR last_failed_login_at <= ${new Date(currentTime.getTime() - 15 * 60_000)}
                THEN 1 ELSE failed_login_count + 1
              END) >= 5
              THEN ${new Date(currentTime.getTime() + 15 * 60_000)}
              ELSE locked_until
            END,
            last_failed_login_at = ${currentTime},
            updated_at = ${currentTime}
          WHERE id = ${targetUserId}
        `);
      }
      await this.db.execute(sql`
        INSERT INTO login_history
          (id, user_id, email, ip_address, user_agent, successful, suspicious, occurred_at)
        VALUES
          (${randomUUID()}, ${targetUserId}, ${normalizedEmail},
           ${ipAddress ?? null}, ${userAgent ?? null}, ${successful},
           ${suspicious}, ${currentTime})
      `);
    } else {
      const row = user
        ? this.rows.get(user.id)
        : [...this.rows.values()].find((candidate) => candidate.email === normalizedEmail);
      targetUserId = row?.id ?? null;
      if (successful && row) {
        const previous = this.history.find(
          (entry) => entry.userId === row.id && entry.successful,
        );
        suspicious =
          !!previous?.ipAddress && !!ipAddress && previous.ipAddress !== ipAddress;
        row.failedLoginCount = 0;
        row.lastFailedLoginAt = null;
        row.lockedUntil = null;
      } else if (row) {
        if (
          !row.lastFailedLoginAt ||
          currentTime.getTime() - row.lastFailedLoginAt.getTime() > 15 * 60_000
        ) {
          row.failedLoginCount = 0;
        }
        row.failedLoginCount += 1;
        row.lastFailedLoginAt = currentTime;
        row.lockedUntil =
          row.failedLoginCount >= 5
            ? new Date(currentTime.getTime() + 15 * 60_000)
            : row.lockedUntil;
      }
      this.history.unshift({
        id: randomUUID(),
        userId: user?.id ?? null,
        email: normalizedEmail,
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent } : {}),
        successful,
        suspicious,
        occurredAt: currentTime,
      });
    }
    return { suspicious };
  }

  async listLoginHistory(userId: string) {
    if (!this.db) {
      return this.history
        .filter((entry) => entry.userId === userId)
        .slice(0, 20);
    }
    const result = await this.db.execute<LoginHistoryEntry>(sql`
      SELECT id, user_id AS "userId", email, ip_address AS "ipAddress",
             user_agent AS "userAgent", successful, suspicious, occurred_at AS "occurredAt"
      FROM login_history
      WHERE user_id = ${userId}
      ORDER BY occurred_at DESC
      LIMIT 20
    `);
    return result.rows;
  }

  async listRoles() {
    if (!this.db) {
      return Object.entries(memoryRolePermissions).map(([key, grants]) => ({
        key,
        description: key,
        system: key !== 'editor',
        permissions: [...grants],
      }));
    }
    const result = await this.db.execute<{
      key: string;
      description: string;
      system: boolean;
      permissions: string[] | null;
    }>(sql`
      SELECT r.key, r.description, r.system,
             COALESCE(array_agg(DISTINCT p.key)
               FILTER (WHERE p.key IS NOT NULL), '{}') AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      GROUP BY r.id
      ORDER BY r.key
    `);
    return result.rows.map((role) => ({
      ...role,
      permissions: role.permissions ?? [],
    }));
  }

  async assignUserRoles(userId: string, roleKeys: Role[], actor: User) {
    const uniqueRoles = [...new Set(roleKeys)];
    if (!uniqueRoles.length) {
      throw new BadRequestException('At least one role is required');
    }
    if (!this.db) {
      const target = this.rows.get(userId);
      if (!target) throw new NotFoundException('User not found');
      if (
        uniqueRoles.includes('superadmin') &&
        !actor.permissions.includes('*')
      ) {
        throw new ForbiddenException('Cannot grant super-admin access');
      }
      if (
        target.roles.includes('superadmin') &&
        !uniqueRoles.includes('superadmin') &&
        !actor.permissions.includes('*')
      ) {
        throw new ForbiddenException('Cannot modify a super admin');
      }
      target.roles = uniqueRoles;
      target.permissions = [...new Set(uniqueRoles.flatMap((role) => memoryRolePermissions[role] ?? []))];
      return publicUser(target);
    }

    await this.db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT pg_advisory_xact_lock(hashtext('fullstack:superadmin-membership'))
      `);
      const target = await tx.execute<{ key: string }>(sql`
        SELECT r.key FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}
      `);
      if (!target.rows.length) {
        const exists = await tx.execute<{ id: string }>(
          sql`SELECT id FROM users WHERE id = ${userId}`,
        );
        if (!exists.rows.length) throw new NotFoundException('User not found');
      }
      const currentRoles = target.rows.map((row) => row.key);
      const changesSuperAdmin =
        currentRoles.includes('superadmin') ||
        uniqueRoles.includes('superadmin');
      if (changesSuperAdmin && !actor.permissions.includes('*')) {
        throw new ForbiddenException('Cannot modify a super admin');
      }
      if (
        currentRoles.includes('superadmin') &&
        !uniqueRoles.includes('superadmin')
      ) {
        const count = await tx.execute<{ count: string }>(sql`
          SELECT count(*)::text AS count FROM user_roles ur
          INNER JOIN roles r ON r.id = ur.role_id
          INNER JOIN users u ON u.id = ur.user_id
          WHERE r.key = 'superadmin' AND u.status = 'active'
        `);
        if (
          Number(count.rows[0]?.count ?? 0) <= 1 &&
          (await tx.execute<{ status: AccountStatus }>(
            sql`SELECT status FROM users WHERE id = ${userId}`,
          )).rows[0]?.status === 'active'
        ) {
          throw new ConflictException('At least one active super admin must remain');
        }
      }

      const selected = await tx.execute<{
        key: string;
        permission: string;
      }>(sql`
        SELECT r.key, p.key AS permission
        FROM roles r
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE r.key IN (${sql.join(uniqueRoles.map((key) => sql`${key}`), sql`, `)})
      `);
      const foundRoles = new Set(selected.rows.map((row) => row.key));
      if (uniqueRoles.some((key) => !foundRoles.has(key))) {
        throw new BadRequestException('Unknown role');
      }
      if (!actor.permissions.includes('*')) {
        const actorPermissions = new Set(actor.permissions);
        if (
          selected.rows.some(
            (row) => row.permission && !actorPermissions.has(row.permission),
          )
        ) {
          throw new ForbiddenException(
            'Cannot assign permissions beyond your own access',
          );
        }
      }

      await tx.execute(sql`DELETE FROM user_roles WHERE user_id = ${userId}`);
      for (const role of uniqueRoles) {
        await tx.execute(sql`
          INSERT INTO user_roles (user_id, role_id)
          SELECT ${userId}, id FROM roles WHERE key = ${role}
        `);
      }
    });
    const updated = await this.findById(userId);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async createRole(
    key: string,
    description: string,
    grants: string[],
    actor: User,
  ) {
    this.assertGrantable(grants, actor);
    if (!this.db) throw new ConflictException('Role storage is unavailable');
    await this.db.transaction(async (tx) => {
      await this.assertKnownPermissions(tx, grants);
      await tx.execute(sql`
        INSERT INTO roles (id, key, description, system)
        VALUES (${'role:' + key}, ${key}, ${description}, false)
      `);
      await this.replaceRolePermissions(tx, key, grants);
    });
    return (await this.listRoles()).find((role) => role.key === key);
  }

  async updateRolePermissions(
    key: string,
    grants: string[],
    actor: User,
  ) {
    this.assertGrantable(grants, actor);
    if (!this.db) throw new NotFoundException('Role not found');
    await this.db.transaction(async (tx) => {
      const result = await tx.execute<{ system: boolean }>(
        sql`SELECT system FROM roles WHERE key = ${key}`,
      );
      const role = result.rows[0];
      if (!role) throw new NotFoundException('Role not found');
      if (role.system && !actor.permissions.includes('*')) {
        throw new ForbiddenException('Cannot change a system role');
      }
      await this.assertKnownPermissions(tx, grants);
      await this.replaceRolePermissions(tx, key, grants);
    });
    return (await this.listRoles()).find((role) => role.key === key);
  }

  async deleteRole(key: string) {
    if (!this.db) throw new NotFoundException('Role not found');
    const result = await this.db.execute<{ system: boolean }>(
      sql`SELECT system FROM roles WHERE key = ${key}`,
    );
    const role = result.rows[0];
    if (!role) throw new NotFoundException('Role not found');
    if (role.system) {
      throw new ConflictException('System roles cannot be deleted');
    }
    const assigned = await this.db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE r.key = ${key}
      ) AS exists
    `);
    if (assigned.rows[0]?.exists) {
      throw new ConflictException('Role is assigned to users');
    }
    await this.db.execute(sql`DELETE FROM roles WHERE key = ${key}`);
  }

  async updateAccountStatus(
    userId: string,
    status: AccountStatus,
    actor: User,
  ) {
    if (actor.id === userId && status !== 'active') {
      throw new ForbiddenException('You cannot disable your own account');
    }
    if (!this.db) {
      const target = this.rows.get(userId);
      if (!target) throw new NotFoundException('User not found');
      if (
        target.roles.includes('superadmin') &&
        !actor.permissions.includes('*')
      ) {
        throw new ForbiddenException('Cannot change a super admin');
      }
      if (
        target.roles.includes('superadmin') &&
        status !== 'active' &&
        [...this.rows.values()].filter((row) =>
          row.roles.includes('superadmin'),
        ).length <= 1
      ) {
        throw new ConflictException('At least one active super admin must remain');
      }
      target.status = status;
      return publicUser(target);
    }

    await this.db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT pg_advisory_xact_lock(hashtext('fullstack:superadmin-membership'))
      `);
      const roles = await tx.execute<{ key: string }>(sql`
        SELECT r.key FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}
      `);
      if (
        roles.rows.some((row) => row.key === 'superadmin') &&
        !actor.permissions.includes('*')
      ) {
        throw new ForbiddenException('Cannot change a super admin');
      }
      const update = await tx.execute<{ id: string }>(sql`
        UPDATE users SET status = ${status}, updated_at = now()
        WHERE id = ${userId}
        RETURNING id
      `);
      if (!update.rows.length) throw new NotFoundException('User not found');
      if (status !== 'active') {
        const superAdminCount = await tx.execute<{ count: string }>(sql`
          SELECT count(*)::text AS count FROM user_roles ur
          INNER JOIN roles r ON r.id = ur.role_id
          INNER JOIN users u ON u.id = ur.user_id
          WHERE r.key = 'superadmin' AND u.status = 'active'
        `);
        const target = await tx.execute<{ status: AccountStatus }>(
          sql`SELECT status FROM users WHERE id = ${userId}`,
        );
        if (
          roles.rows.some((row) => row.key === 'superadmin') &&
          target.rows[0]?.status === 'active' &&
          Number(superAdminCount.rows[0]?.count ?? 0) <= 1
        ) {
          throw new ConflictException('At least one active super admin must remain');
        }
        await tx.execute(sql`
          INSERT INTO revoked_refresh_token_families (family_id, revoked_at)
          SELECT DISTINCT family_id, now() FROM refresh_tokens
          WHERE user_id = ${userId}
          ON CONFLICT (family_id) DO NOTHING
        `);
        await tx.execute(
          sql`UPDATE refresh_tokens SET revoked = true WHERE user_id = ${userId}`,
        );
        await tx.execute(sql`DELETE FROM sessions WHERE user_id = ${userId}`);
      }
    });
    const updated = await this.findById(userId);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async listManagedUsers() {
    if (!this.db) {
      return [...this.rows.values()].map(publicUser);
    }
    const result = await this.db.execute<UserRow>(
      sql`${USER_SELECT} GROUP BY u.id ORDER BY u.created_at DESC LIMIT 100`,
    );
    return result.rows.map(fromRow);
  }

  private assertGrantable(grants: string[], actor: User) {
    if (
      !actor.permissions.includes('*') &&
      grants.some((permission) => !actor.permissions.includes(permission))
    ) {
      throw new ForbiddenException(
        'Cannot grant permissions beyond your own access',
      );
    }
  }

  private async assertKnownPermissions(
    tx: Parameters<Parameters<Database['transaction']>[0]>[0],
    grants: string[],
  ) {
    if (!grants.length) return;
    const result = await tx.execute<{ key: string }>(sql`
      SELECT key FROM permissions
      WHERE key IN (${sql.join(grants.map((key) => sql`${key}`), sql`, `)})
    `);
    if (new Set(result.rows.map((row) => row.key)).size !== new Set(grants).size) {
      throw new BadRequestException('Unknown permission');
    }
  }

  private async replaceRolePermissions(
    tx: Parameters<Parameters<Database['transaction']>[0]>[0],
    key: string,
    grants: string[],
  ) {
    if (key === 'superadmin' && !grants.includes('*')) {
      throw new ConflictException('Super-admin access must remain unrestricted');
    }
    await tx.execute(sql`
      DELETE FROM role_permissions
      WHERE role_id = (SELECT id FROM roles WHERE key = ${key})
    `);
    for (const permission of new Set(grants)) {
      await tx.execute(sql`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r CROSS JOIN permissions p
        WHERE r.key = ${key} AND p.key = ${permission}
      `);
    }
  }

  private async findUser(statement: SQL): Promise<User | null> {
    if (!this.db) return null;
    const result = await this.db.execute<UserRow>(statement);
    const row = result.rows[0];
    return row ? fromRow(row) : null;
  }
}

const memoryRolePermissions: Record<string, string[]> = {
  superadmin: ['*'],
  admin: [
    'dashboard.read',
    'products.read',
    'products.create',
    'products.update',
    'products.delete',
    'orders.read',
    'orders.create',
    'orders.update',
    'orders.refund',
    'customers.read',
    'customers.update',
    'customers.suspend',
    'staff.read',
    'roles.read',
    'settings.read',
    'settings.update',
  ],
  staff: [
    'dashboard.read',
    'products.read',
    'products.update',
    'orders.read',
    'customers.read',
    'staff.read',
  ],
  customer: [
    'account.read',
    'account.update',
    'orders.read.own',
    'orders.create.own',
    'wishlist.manage.own',
  ],
  editor: ['dashboard.read', 'products.read', 'products.create', 'products.update'],
};

const publicUser = ({
  passwordHash: _passwordHash,
  failedLoginCount: _failedLoginCount,
  lockedUntil: _lockedUntil,
  ...user
}: MemoryUser): User => ({
  ...user,
  roles: [...user.roles],
  permissions: [...user.permissions],
});
