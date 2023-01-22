import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { SwabAreaHistory } from '~/swab/entities/swab-area-history.entity';
import { CleaningHistoryCleaningValidation } from './cleaning-history-cleaning-validation.entity';
import { CleaningProgram } from './cleaning-program.entity';
import { CleaningValidation } from './cleaning-validation.entity';

@Entity()
export class CleaningHistory extends BaseSoftDeletableEntity {
  @Column({ type: 'timestamp' })
  cleaningHistoryStartedAt!: Date;

  @Column({ type: 'timestamp' })
  cleaningHistoryEndedAt!: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  cleaningProgramId: string;

  @ManyToOne(() => CleaningProgram, (entity) => entity.cleaningHistories, {
    onDelete: 'SET NULL',
  })
  cleaningProgram: CleaningProgram;

  @OneToOne(() => SwabAreaHistory, (entity) => entity.cleaningHistory)
  swabAreaHistory: SwabAreaHistory[];

  @OneToMany(
    () => CleaningHistoryCleaningValidation,
    (entity) => entity.cleaningHistory,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  cleaningHistoryValidations: CleaningHistoryCleaningValidation[];
}
