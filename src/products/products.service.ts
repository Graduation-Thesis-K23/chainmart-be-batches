import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {
      sync_id,
      product_code,
      price,
      sale,
      name,
      acceptable_expiry_threshold,
    } = createProductDto;
    try {
      const product = this.productRepository.create({
        sync_id,
        product_code,
        price,
        sale,
        name,
        acceptable_expiry_threshold,
      });
      await this.productRepository.save(product);
    } catch (error) {
      console.error(error);
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  async findById(id: string) {
    try {
      return await this.productRepository.findOne({
        where: {
          sync_id: id,
        },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    try {
      const result = await this.productRepository.softDelete(id);

      if (result.affected === 0) {
        return `Product with id(${id}) not found`;
      }

      return `Product with id(${id}) have been deleted`;
    } catch (error) {
      console.error(error);
      return `Product with id(${id}) failed to delete`;
    }
  }
}
