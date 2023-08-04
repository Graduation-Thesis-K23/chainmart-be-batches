import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { BatchesService } from './batches.service';
import { ExceptionFilter } from 'src/filters/rpc-exception.filter';

@Controller()
@UseFilters(new ExceptionFilter())
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @MessagePattern('batches.create')
  create(@Payload() createBatchDto: any) {
    console.log('createBatchDto', createBatchDto);
    return this.batchesService.create(createBatchDto);
  }

  @MessagePattern('batches.findall')
  findAll(@Payload() branch_id: string) {
    return this.batchesService.findAll(branch_id);
  }

  @MessagePattern('batches.findallbyproductid')
  findAllByProductId(@Payload() productId: string) {
    return this.batchesService.findAllByProductId(productId);
  }

  @MessagePattern('batches.findbyid')
  findOne(@Payload() id: string) {
    return this.batchesService.findById(id);
  }

  @MessagePattern('batches.update')
  update(@Payload() updateBatchDto: any) {
    return this.batchesService.update(updateBatchDto.id, updateBatchDto);
  }

  @MessagePattern('batches.delete')
  delete(@Payload() id: string) {
    return this.batchesService.delete(id);
  }

  @MessagePattern('batches.package')
  processBatchesByOrderDetails(@Payload() orderDetails: any) {
    return this.batchesService.processBatchesByOrderDetails(orderDetails);
  }

  @MessagePattern('batches.getavailablequantity')
  getAvailableQuantity(@Payload() availableDto: any) {
    return this.batchesService.getAvailableQuantity(availableDto);
  }
}
