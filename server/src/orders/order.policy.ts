import { Policy } from '@nestjs/authorization';
import type { User } from '../users/user.js';
import type { Order } from './order.js';
import { RefundLimitsService } from './refund-limits.service.js';

const hasPermission = (user: User, permission: string) =>
  user.permissions.includes('*') || user.permissions.includes(permission);

@Policy()
export class OrderPolicy {
  constructor(private readonly refundLimitsService: RefundLimitsService) {}

  viewAll(user: User) {
    return hasPermission(user, 'orders.read');
  }

  // Customers see their own orders; staff see everyone's.
  view(user: User, order: Order) {
    return (
      (order.userId === user.id && hasPermission(user, 'orders.read.own')) ||
      hasPermission(user, 'orders.read')
    );
  }

  // Customers list their own orders; staff list anyone's. A guest is denied.
  viewOrdersOf(user: User | null, customerId: string) {
    return (
      !!user &&
      ((user.id === customerId && hasPermission(user, 'orders.read.own')) ||
        hasPermission(user, 'orders.read'))
    );
  }

  viewOwn(user: User | null) {
    return !!user && hasPermission(user, 'orders.read.own');
  }

  createOwn(user: User | null) {
    return !!user && hasPermission(user, 'orders.create.own');
  }

  create(user: User | null) {
    return !!user && hasPermission(user, 'orders.create');
  }

  // Staff refund paid orders up to their limit. Pending, shipped and
  // refunded orders can't be refunded by anyone.
  async refund(user: User, order: Order) {
    if (!hasPermission(user, 'orders.refund') || order.status !== 'paid') {
      return false;
    }

    return order.total <= (await this.refundLimitsService.maxRefundFor(user));
  }
}
