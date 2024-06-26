import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';
import { User } from '../../auth/entities/user.entity';
import { BaseSoftDeletableIncrementEntity } from '../../common/entities/base-softdeletable-increment.entity';
import { BacteriaSpecie } from '../../lab/entities/bacteria-specie.entity';
import { Bacteria } from '../../lab/entities/bacteria.entity';
import { SwabAreaHistory } from './swab-area-history.entity';
import { SwabProductHistory } from './swab-product-history.entity';
import { SwabRound } from './swab-round.entity';
import { SwabSampleType } from './swab-sample-type.entity';

export const SWAB_TEST_CODE_PREFIX = 'AI';

export enum SwabStatus {
  NOT_RECORDED = 'notRecorded',
  PENDING = 'pending',
  DETECTED = 'detected',
  NORMAL = 'normal',
  ALL = 'all',
}

@Entity()
export class SwabTest extends BaseSoftDeletableIncrementEntity {
  @Column({ unique: true })
  swabTestCode: string;

  @Column({ type: 'timestamp', nullable: true })
  swabTestRecordedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bacteriaRecordedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bacteriaSpecieRecordedAt: Date;

  @Column({ type: 'text', nullable: true })
  swabTestNote?: string;

  @Column({ default: false })
  isReported!: boolean;

  @Column({ type: 'text', nullable: true })
  reportReason!: string;

  @Column({ type: 'text', nullable: true })
  reportDetail!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  reportedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.reportedSwabTests, {
    onDelete: 'SET NULL',
  })
  reportedUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true })
  recordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabTests, {
    onDelete: 'SET NULL',
  })
  recordedUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true })
  bacteriaRecordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabTests, {
    onDelete: 'SET NULL',
  })
  bacteriaRecordedUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true })
  bacteriaSpecieRecordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabTests, {
    onDelete: 'SET NULL',
  })
  bacteriaSpecieRecordedUser: User;

  @ManyToMany(() => Bacteria, { cascade: ['insert', 'update'] })
  @JoinTable()
  bacteria!: Bacteria[];

  @ManyToMany(() => BacteriaSpecie, { cascade: ['insert', 'update'] })
  @JoinTable()
  bacteriaSpecies!: BacteriaSpecie[];

  @Column({ nullable: true })
  swabRoundId: number;

  @ManyToOne(() => SwabRound, (entity) => entity.swabTests)
  @JoinColumn()
  swabRound?: SwabRound;

  @Column({ nullable: true })
  swabTestOrder: number;

  @OneToOne(() => SwabAreaHistory, (entity) => entity.swabTest)
  swabAreaHistory: SwabAreaHistory;

  @OneToOne(() => SwabProductHistory, (entity) => entity.swabTest)
  swabProductHistory: SwabProductHistory;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importTransactionId?: string;

  @ManyToOne(() => ImportTransaction, (entity) => entity.swabTests)
  importTransaction?: ImportTransaction;

  @Column({ type: 'varchar', length: 36, nullable: true })
  swabSampleTypeId?: number;

  @ManyToOne(() => SwabSampleType, (entity) => entity.swabTests, { cascade: ["insert", "update"] })
  @JoinColumn()
  swabSampleType?: SwabSampleType;
}
