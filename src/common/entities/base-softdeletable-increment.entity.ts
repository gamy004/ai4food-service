import { DeleteDateColumn } from 'typeorm';
import { BaseIncrementEntity } from './base-increment.entity';

export abstract class BaseSoftDeletableIncrementEntity extends BaseIncrementEntity {
  @DeleteDateColumn()
  deletedAt?: Date;
}
