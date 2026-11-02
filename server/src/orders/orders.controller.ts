import { Authenticate } from '@nestjs/authentication';
import { Body, Controller, Get, Post } from '@nestjs/common';
import type { OrderItem } from './order.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findMine() {
    return this.ordersService.findMine();
  }

  // Receipts and shipping updates go to the customer's email address,
  // so it must be one they proved.
  @Authenticate({ verifiedEmail: true })
  @Post()
  place(@Body('items') items: OrderItem[]) {
    return this.ordersService.place(items);
  }
}
