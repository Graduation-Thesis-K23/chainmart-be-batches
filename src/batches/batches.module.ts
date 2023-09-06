import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { Batch } from './entities/batch.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: 'ORCHESTRATION_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'orchestration',
              brokers: configService.get('KAFKA_BROKERS').split(','),
            },
            consumer: {
              groupId: 'orchestration-consumer-batches',
            },
          },
        }),
      },
    ]),
    ProductsModule,
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
