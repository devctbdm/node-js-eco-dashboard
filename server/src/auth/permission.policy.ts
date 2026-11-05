import { Policy } from '@nestjs/authorization';
import type { User } from '../users/user.js';

@Policy()
export class PermissionPolicy {
  has(user: User | null, permission: string) {
    return (
      !!user &&
      (user.permissions.includes('*') || user.permissions.includes(permission))
    );
  }
}
