import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';

const permissions = [
  'dashboard.read',
  'account.read',
  'account.update',
  'orders.read.own',
  'orders.create.own',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.refund',
  'customers.read',
  'customers.update',
  'customers.suspend',
  'products.read',
  'products.create',
  'products.update',
  'products.delete',
  'staff.read',
  'staff.manage',
  'roles.read',
  'roles.manage',
  'settings.read',
  'settings.update',
  'wishlist.manage.own',
];

const rolePermissions: Record<string, string[]> = {
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
  editor: [
    'dashboard.read',
    'products.read',
    'products.create',
    'products.update',
  ],
};

const roleDescriptions: Record<string, string> = {
  superadmin: 'Full system access',
  admin: 'Administrative access limited to assigned permissions',
  staff: 'Staff access limited to assigned modules and actions',
  customer: 'Customer access to their own account and resources',
  editor: 'Product editing access',
};

@Injectable()
export class RbacService implements OnModuleInit {
  constructor(
    @Optional() @Inject(DATABASE) private readonly db: Database | null,
  ) {}

  async onModuleInit() {
    if (!this.db) return;

    await this.db.transaction(async (tx) => {
      for (const [key, description] of Object.entries(roleDescriptions)) {
        await tx.execute(sql`
          INSERT INTO roles (id, key, description, system)
          VALUES (${'role:' + key}, ${key}, ${description}, true)
          ON CONFLICT (key) DO NOTHING
        `);
      }

      for (const key of [...permissions, '*']) {
        await tx.execute(sql`
          INSERT INTO permissions (id, key, description)
          VALUES (${'permission:' + key}, ${key}, ${key})
          ON CONFLICT (key) DO NOTHING
        `);
      }

      for (const [role, grants] of Object.entries(rolePermissions)) {
        for (const permission of grants) {
          await tx.execute(sql`
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT ${'role:' + role}, ${'permission:' + permission}
            WHERE EXISTS (
              SELECT 1 FROM roles WHERE id = ${'role:' + role}
            )
            ON CONFLICT DO NOTHING
          `);
        }
      }
    });
  }
}
