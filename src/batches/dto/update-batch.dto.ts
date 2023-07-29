import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateBatchDto } from './create-batch.dto';

export class UpdateBatchDto extends PartialType(CreateBatchDto) {
  @IsString()
  @IsNotEmpty()
  id: string;
}
