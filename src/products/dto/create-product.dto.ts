import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sync_id: string;

  @IsString()
  @IsNotEmpty()
  product_code: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  sale?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  acceptable_expiry_threshold?: number;
}
