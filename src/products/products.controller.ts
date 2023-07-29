import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { ProductsService } from './products.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductsService) {}

  @EventPattern('batches.orders.created')
  create(@Payload() createOrderDto: any) {
    this.productService.create(createOrderDto);
  }
}
