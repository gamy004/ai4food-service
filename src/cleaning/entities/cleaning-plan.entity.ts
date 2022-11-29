import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
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
    onDelete: 'CASCADE',
  })
  cleaningProgram: CleaningProgram;

  @Column({ type: 'varchar', length: 36 })
  facilityItemId: string;

  @ManyToOne(() => FacilityItem, (entity) => entity.cleaningPlans, {
    onDelete: 'CASCADE',
  })
  facilityItem: FacilityItem;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importTransactionId?: string;

  @ManyToOne(() => ImportTransaction, (entity) => entity.cleaningPlans, {
    onDelete: 'CASCADE',
  })
  importTransaction?: ImportTransaction;
}
