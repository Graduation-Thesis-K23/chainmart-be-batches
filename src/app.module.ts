import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configValidationSchema } from './config/validate-env';
import { DatabaseModule } from './database/database.module';
import { BatchesModule } from './batches/batches.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    DatabaseModule,
    BatchesModule,
    ProductsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
