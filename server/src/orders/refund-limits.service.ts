import { Injectable } from '@nestjs/common';
import { ada } from '../users/demo-users.js';
import type { User } from '../users/user.js';

@Injectable()
export class RefundLimitsService {
  // Per-person limits set by finance, in cents, by user id. Stands in for a table or a config service.
  private readonly limits = new Map<string, number>([[ada.id, 100_000]]);

  async maxRefundFor(user: User): Promise<number> {
    return this.limits.get(user.id) ?? 10_000;
  }
}
