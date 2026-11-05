import { Authenticate } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  IsArray,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { OrderItem } from './order.js';
import { OrderPolicy } from './order.policy.js';
import { OrdersService } from './orders.service.js';

@ValidatorConstraint({ name: 'orderItems', async: false })
class OrderItemsValidator implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return (
      Array.isArray(value) &&
      value.length >= 1 &&
      value.length <= 20 &&
      value.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          !Array.isArray(item) &&
          'productId' in item &&
          'quantity' in item &&
          Object.keys(item).every((key) => ['productId', 'quantity'].includes(key)) &&
          typeof item.productId === 'string' &&
          item.productId.length >= 1 &&
          item.productId.length <= 100 &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= 100,
      )
    );
  }

  defaultMessage(_args: ValidationArguments) {
    return 'items must contain 1 to 20 valid order items';
  }
}

class PlaceOrderDto {
  @IsArray()
  @Validate(OrderItemsValidator)
  items: OrderItem[];
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Can(OrderPolicy, 'viewOwn')
  findMine() {
    return this.ordersService.findMine();
  }

  // Receipts and shipping updates go to the customer's email address,
  // so it must be one they proved.
  @Authenticate({ verifiedEmail: true })
  @Post()
  @Can(OrderPolicy, 'createOwn')
  place(@Body() body: PlaceOrderDto) {
    return this.ordersService.place(body.items);
  }
}
