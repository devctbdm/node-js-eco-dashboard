import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { RefundLimitsService } from './refund-limits.service.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, RefundLimitsService],
  exports: [RefundLimitsService],
})
export class OrdersModule {}
