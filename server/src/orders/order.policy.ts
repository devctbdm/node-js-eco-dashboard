import { Policy } from '@nestjs/authorization';
import type { User } from '../users/user.js';
import type { Order } from './order.js';
import { RefundLimitsService } from './refund-limits.service.js';

@Policy()
export class OrderPolicy {
  constructor(private readonly refundLimitsService: RefundLimitsService) {}

  viewAll(user: User) {
    return user.roles.includes('staff');
  }

  // Customers see their own orders; staff see everyone's.
  view(user: User, order: Order) {
    return order.userId === user.id || user.roles.includes('staff');
  }

  // Customers list their own orders; staff list anyone's. A guest is denied.
  viewOrdersOf(user: User | null, customerId: string) {
    return !!user && (user.id === customerId || user.roles.includes('staff'));
  }

  // Staff refund paid orders up to their limit. Pending, shipped and
  // refunded orders can't be refunded by anyone.
  async refund(user: User, order: Order) {
    if (!user.roles.includes('staff') || order.status !== 'paid') {
      return false;
    }
    return order.total <= (await this.refundLimitsService.maxRefundFor(user));
  }
}
