import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { CleaningHistory } from './cleaning-history.entity';
import { CleaningPlan } from './cleaning-plan.entity';

@Entity()
export class CleaningProgram extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  cleaningProgramName!: string;

  @Column({ type: 'text', nullable: true })
  cleaningProgramDescription!: string;

  @OneToMany(() => CleaningPlan, (entity) => entity.cleaningProgram)
  cleaningPlans: CleaningPlan[];

  @OneToMany(() => CleaningHistory, (entity) => entity.cleaningProgram)
  cleaningHistories: CleaningHistory[];
}
