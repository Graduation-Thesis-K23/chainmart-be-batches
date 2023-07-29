import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({
    unique: true,
  })
  sync_id: string;

  @Column({
    unique: true,
  })
  product_code: string;

  @Column()
  price: number;

  @Column()
  sale: number;

  @Column({
    default: 100 * 365, // 100 years
  })
  acceptable_expiry_threshold: number;
}
