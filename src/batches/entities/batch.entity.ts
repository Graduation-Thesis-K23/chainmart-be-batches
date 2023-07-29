import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common/base.entity';

@Entity('batches')
export class Batch extends BaseEntity {
  @Column()
  batch_code: string;

  @Column()
  product_id: string;

  @Column({ type: 'int' })
  import_quantity: number;

  @Column({ type: 'decimal' })
  import_cost: number;

  @Column({ type: 'date' })
  expiry_date: string;

  @Column({ nullable: true })
  branch_id: string;

  @Column({ type: 'int', default: 0 })
  sold: number;

  @Column({ nullable: true })
  employee_create_id: string;
}
