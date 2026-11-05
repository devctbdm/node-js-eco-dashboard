import { Can } from '@nestjs/authorization';
import {
  Controller,
  Delete,
  HttpCode,
  Inject,
  Param,
} from '@nestjs/common';
import { ProductPolicy } from './product.policy.js';

interface ProductRemovalService {
  remove(id: string): void;
}

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('ProductsService')
    private readonly productsService: ProductRemovalService,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @Can(ProductPolicy, 'delete')
  remove(@Param('id') id: string) {
    this.productsService.remove(id);
  }
}
