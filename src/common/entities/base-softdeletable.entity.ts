import { DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseSoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn()
  deletedAt?: Date;
}
