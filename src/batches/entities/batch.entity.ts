import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/base.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('batches')
export class Batch extends BaseEntity {
  @Column()
  batch_code: string;

  @Column()
  product_id: string;

  @ManyToOne(() => Product, (product) => product.sync_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    referencedColumnName: 'sync_id',
    name: 'product_id',
  })
  product: Product;

  @Column({ type: 'int' })
  import_quantity: number;

  @Column({ type: 'decimal' })
  import_cost: number;

  @Column({ type: 'date' })
  expiry_date: string;

  @Column()
  branch_id: string;

  @Column({ type: 'int', default: 0 })
  sold: number;

  @Column()
  employee_create_phone: string;
}
