import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { Shift } from '~/common/enums/shift';
import { SwabPeriod } from './swab-period.entity';

@Entity()
export class SwabPlan extends BaseSoftDeletableEntity {
  @Column({ type: 'enum', enum: Shift })
  shift!: Shift;

  @Column({ type: 'date' })
  swabPlanDate!: Date;

  @Column({ type: 'text', nullable: true })
  swabPlanNote?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  swabPlanCode?: string;

  @Column({ type: 'integer', default: 0 })
  totalItems!: number;

  @Column({ default: false })
  publish!: boolean;

  @Column({ type: 'varchar', length: 36 })
  swabPeriodId!: string;

  @ManyToOne(() => SwabPeriod, (entity) => entity.swabPlans)
  swabPeriod: SwabPeriod;
}
