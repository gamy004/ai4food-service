import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { Facility } from '~/facility/entities/facility.entity';
import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';
import { CleaningProgram } from './cleaning-program.entity';

@Entity()
export class CleaningPlan extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  cleaningPlanName!: string;

  @Column({ type: 'date' })
  cleaningPlanDate: Date;

  @Column({ type: 'varchar', length: 36 })
  cleaningProgramId: string;

  @ManyToOne(() => CleaningProgram, (entity) => entity.cleaningPlans, {
    onDelete: 'SET NULL',
  })
  cleaningProgram: CleaningProgram;

  @Column({ type: 'varchar', length: 36 })
  facilityId: string;

  @ManyToOne(() => Facility, (entity) => entity.cleaningPlans, {
    onDelete: 'SET NULL',
  })
  facility: Facility;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importTransactionId?: string;

  @ManyToOne(() => ImportTransaction, (entity) => entity.cleaningPlans)
  importTransaction?: ImportTransaction;
}
