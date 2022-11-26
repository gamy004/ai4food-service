import { Column, Entity, ManyToOne } from 'typeorm';
import { Shift } from '~/common/enums/shift';
import { BaseSoftDeletableEntity } from '../../common/entities/base-softdeletable.entity';
import { ImportTransaction } from '../../import-transaction/entities/import-transaction.entity';
import { Product } from '../../product/entities/product.entity';
// Entity (Domain Layer)
@Entity()
export class ProductSchedule extends BaseSoftDeletableEntity {
  @Column()
  productScheduleAmount!: number;

  @Column({ type: 'date' })
  productScheduleDate!: Date;

  @Column({ type: 'time' })
  productScheduleStartedAt!: string;

  @Column({ type: 'timestamp' })
  productScheduleStartedAtTimestamp!: Date;

  @Column({ type: 'time' })
  productScheduleEndedAt!: string;

  @Column({ type: 'timestamp' })
  productScheduleEndedAtTimestamp!: Date;

  @Column({ type: 'enum', enum: Shift, nullable: true })
  shift: Shift;

  @Column({ type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (entity) => entity.productSchedules)
  product!: Product;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importTransactionId?: string;

  @ManyToOne(() => ImportTransaction, (entity) => entity.productSchedules)
  importTransaction?: ImportTransaction;
}
