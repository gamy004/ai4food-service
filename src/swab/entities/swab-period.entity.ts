import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CleaningValidation } from '~/cleaning/entities/cleaning-validation.entity';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabAreaHistory } from './swab-area-history.entity';
import { SwabCleaningValidation } from './swab-cleaning-validation.entity';
import { SwabProductHistory } from './swab-product-history.entity';
import { SwabPlan } from './swab-plan.entity';

@Entity()
export class SwabPeriod extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  swabPeriodName!: string;

  @Column({ default: false })
  requiredValidateCleaning!: boolean;

  @Column({ nullable: true })
  swabPeriodOrder: number;

  @OneToMany(() => SwabAreaHistory, (entity) => entity.swabPeriod)
  swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabProductHistory, (entity) => entity.swabPeriod)
  swabProductHistories: SwabProductHistory[];

  @ManyToMany(() => CleaningValidation, { cascade: ['insert', 'update'] })
  @JoinTable()
  cleaningValidations: CleaningValidation[];

  @OneToMany(() => SwabCleaningValidation, (entity) => entity.swabPeriod)
  swabCleaningValidations: SwabCleaningValidation[];

  @OneToMany(() => SwabPlan, (entity) => entity.swabPeriod)
  swabPlans: SwabPlan[];
}
