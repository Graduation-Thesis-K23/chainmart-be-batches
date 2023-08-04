import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  DataSource,
  type EntityManager,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import * as moment from 'moment';
import { instanceToPlain } from 'class-transformer';

import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { Batch } from './entities/batch.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class BatchesService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    private readonly productService: ProductsService,

    @Inject('ORCHESTRATION_SERVICE')
    private readonly orchestrationClient: ClientKafka,
  ) {}

  async create(createBatchDto: CreateBatchDto) {
    console.log('createBatchDto', createBatchDto);

    const product = await this.productService.findById(
      createBatchDto.product_id,
    );
    if (!product) {
      throw new RpcException('Product not found');
    }

    const { product_code } = product;
    const batch_code =
      product_code + '-' + moment().format('YYYY_MM_DD') + '-' + Date.now();

    try {
      const batch = this.batchRepository.create({
        ...createBatchDto,
        batch_code,
      });
      await this.batchRepository.save(batch);

      return instanceToPlain(batch);
    } catch (error) {
      console.error(error);
      throw new RpcException('Cannot create batch');
    }
  }

  async findAll(branch_id: string) {
    try {
      const batches = await this.batchRepository.find({
        where: {
          branch_id,
        },
        relations: {
          product: true,
        },
      });

      return instanceToPlain(batches);
    } catch (error) {
      console.error(error);
      throw new RpcException('Cannot find batches');
    }
  }

  async findAllByProductId(productId: string) {
    const product = await this.productService.findById(productId);
    if (!product) {
      throw new RpcException('Product not found');
    }

    try {
      const batches = await this.batchRepository.find({
        where: {
          product_id: productId,
        },
      });

      return instanceToPlain(batches);
    } catch (error) {
      console.error(error);
      throw new RpcException('Cannot find batches by product_id');
    }
  }

  async findById(id: string) {
    try {
      const batch = await this.batchRepository.findOne({
        where: {
          id,
        },
      });

      return instanceToPlain(batch);
    } catch (error) {
      console.error(error);
      throw new RpcException(`Cannot find batch with id(${id})`);
    }
  }

  async update(id: string, updateBatchDto: UpdateBatchDto): Promise<any> {
    return `This action updates a #${id} batch`;
  }

  async delete(id: string) {
    try {
      const result = await this.batchRepository.softDelete(id);

      if (result.affected === 0) {
        throw new RpcException(`Batch with id(${id}) not found`);
      }

      return `Batch with id(${id}) have been deleted`;
    } catch (error) {
      console.error(error);
      throw new RpcException(`Cannot delete batch with id(${id})`);
    }
  }

  async processBatchesByOrderDetails(orderDetails) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await Promise.all(
        orderDetails.map(async ({ product_id, quantity }) =>
          this.updateBatchesByOrderDetails(
            product_id,
            quantity,
            queryRunner.manager,
          ),
        ),
      );
      await queryRunner.commitTransaction();
      return 'Packaged';
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new RpcException(`Failed`);
    } finally {
      await queryRunner.release();
    }
  }

  async getAvailableQuantity(availableDto) {
    // const { product_id, branch_id } = availableDto[0];

    console.log('availableDto', availableDto);

    const products = await Promise.all(
      availableDto.map(async ({ product_id, branch_id }) => {
        const batches = await this.batchRepository.find({
          where: {
            product_id,
            branch_id,
          },
        });

        const available = batches.reduce(
          (prev, curr) => prev + (curr.import_quantity - curr.sold),
          0,
        );

        return {
          product_id,
          available,
        };
      }),
    );

    console.log('products-available', products);

    return products;
  }

  private async updateBatchesByOrderDetails(
    product_id: string,
    quantity: number,
    entityManager: EntityManager,
  ) {
    const product = await entityManager.findOne(Product, {
      where: {
        sync_id: product_id,
      },
    });
    if (!product) {
      throw new Error('Invalid product id');
    }

    const neverExpiryThreshold = 356 * 100; // 100 years
    const expiryDate = moment()
      .add(product.acceptable_expiry_threshold || neverExpiryThreshold, 'days')
      .format('YYYY-MM-DD');

    const batches = await entityManager.find(Batch, {
      where: {
        product_id,
        expiry_date: MoreThanOrEqual(expiryDate),
      },
      order: {
        expiry_date: 'ASC',
      },
    });
    if (batches.length === 0) {
      throw new Error('Cannot found any batch');
    }

    const totalQuantityInBatch = batches.reduce(
      (prev, curr) => prev + (curr.import_quantity - curr.sold),
      0,
    );
    if (totalQuantityInBatch < quantity) {
      throw new Error('Not sufficient quantity');
    }

    let requiredQuantity = quantity;
    for (const batch of batches) {
      const batchRemainQuantity = batch.import_quantity - batch.sold;
      const consumed = Math.min(requiredQuantity, batchRemainQuantity);

      await entityManager.update(Batch, batch.id, {
        sold: batch.sold + consumed,
      });

      requiredQuantity -= consumed;
      if (requiredQuantity === 0) {
        break;
      }
    }
  }
}
