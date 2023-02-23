import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '~/auth/entities/user.entity';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { SwabAreaHistory } from '~/swab/entities/swab-area-history.entity';
import { SwabRound } from '~/swab/entities/swab-round.entity';
import { CleaningHistoryCleaningValidation } from './cleaning-history-cleaning-validation.entity';
import { CleaningProgram } from './cleaning-program.entity';
import { CleaningValidation } from './cleaning-validation.entity';

export enum CleaningType {
  DRY = 'dry',
  WET = 'wet',
}

@Entity()
export class CleaningHistory extends BaseSoftDeletableEntity {
  @Column({ type: 'timestamp', nullable: true })
  cleaningHistoryStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cleaningHistoryEndedAt: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  cleaningProgramId: string;

  @ManyToOne(() => CleaningProgram, (entity) => entity.cleaningHistories, {
    onDelete: 'SET NULL',
  })
  cleaningProgram: CleaningProgram;

  @Column({ type: 'varchar', length: 36 })
  swabAreaHistoryId: string;

  @OneToOne(() => SwabAreaHistory, (entity) => entity.cleaningHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  swabAreaHistory?: SwabAreaHistory;

  @OneToMany(
    () => CleaningHistoryCleaningValidation,
    (entity) => entity.cleaningHistory,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  cleaningHistoryValidations: CleaningHistoryCleaningValidation[];

  @Column({ type: 'varchar', length: 36, nullable: true })
  recordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedCleaningHistories, {
    onDelete: 'SET NULL',
  })
  recordedUser: User;

  @Column({ nullable: true })
  swabRoundId: number;

  @ManyToOne(() => SwabRound, (entity) => entity.cleaningHistories)
  @JoinColumn()
  swabRound?: SwabRound;

  @Column({ type: 'enum', enum: CleaningType, nullable: true })
  cleaningType: CleaningType;
}
