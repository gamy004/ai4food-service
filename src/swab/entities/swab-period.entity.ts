import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabAreaHistory } from './swab-area-history.entity';
import { SwabProductHistory } from './swab-product-history.entity';

@Entity()
export class SwabPeriod extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  swabPeriodName!: string;

  @OneToMany(() => SwabAreaHistory, (entity) => entity.swabPeriod)
  swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabProductHistory, (entity) => entity.swabPeriod)
  swabProductHistories: SwabProductHistory[];
}
