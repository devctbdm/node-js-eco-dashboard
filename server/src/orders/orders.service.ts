import { AuthenticationContext } from '@nestjs/authentication';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { User } from '../users/user.js';
import type { Order, OrderItem } from './order.js';

// Stand-in for the products table: product id → price in cents.
const PRICES = new Map([
  ['salmon-kibble-2kg', 2499],
  ['clumping-litter-10l', 1599],
]);

@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [];

  constructor(
    private readonly authenticationContext: AuthenticationContext<User>,
  ) {}

  findMine(): Order[] {
    const { id } = this.authenticationContext.requireUser();
    return this.orders.filter((order) => order.userId === id);
  }

  place(items: OrderItem[]): Order {
    const { id: userId } = this.authenticationContext.requireUser();
    const total = items.reduce(
      (sum, item) => sum + this.price(item.productId) * item.quantity,
      0,
    );
    const order: Order = {
      id: randomUUID(),
      userId,
      items,
      total,
      status: 'pending',
    };
    this.orders.push(order);
    return order;
  }

  private price(productId: string): number {
    const price = PRICES.get(productId);
    if (price === undefined) {
      throw new BadRequestException(`Unknown product ${productId}`);
    }
    return price;
  }
}
