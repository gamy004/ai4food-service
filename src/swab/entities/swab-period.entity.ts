import { Column, Entity, OneToMany } from 'typeorm';
import { CleaningValidation } from '~/cleaning/entities/cleaning-validation.entity';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabAreaHistory } from './swab-area-history.entity';
import { SwabProductHistory } from './swab-product-history.entity';

@Entity()
export class SwabPeriod extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  swabPeriodName!: string;

  @Column({ default: false })
  requiredValidateCleaning!: boolean;

  @OneToMany(() => SwabAreaHistory, (entity) => entity.swabPeriod)
  swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabProductHistory, (entity) => entity.swabPeriod)
  swabProductHistories: SwabProductHistory[];

  @OneToMany(() => CleaningValidation, (entity) => entity.swabPeriod, {
    cascade: ['insert', 'update', 'soft-remove'],
  })
  cleaningValidations: CleaningValidation[];
}
