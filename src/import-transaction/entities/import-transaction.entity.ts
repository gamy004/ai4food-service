import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CleaningPlan } from '~/cleaning/entities/cleaning-plan.entity';
import { CleaningRoomHistory } from '~/cleaning/entities/cleaning-room-history.entity';
import { File } from '~/common/entities/file.entity';
import { SwabTest } from '~/swab/entities/swab-test.entity';
import { User } from '../../auth/entities/user.entity';
import { BaseSoftDeletableEntity } from '../../common/entities/base-softdeletable.entity';
import { ProductSchedule } from '../../product/entities/product-schedule.entity';

export enum ImportSource {
  WEB = 'web',
  OPERATOR = 'operator',
}

export enum ImportType {
  PRODUCT_SCHEDULE = 'product_schedule',
  CLEANING_PLAN = 'cleaning_plan',
  CLEANING_ROOM_HISTORY = 'cleaning_room_history',
  SWAB_TEST = 'swab_test',
}

export enum ImportStatus {
  Pending = 'pending',
  Success = 'success',
  Cancel = 'cancel',
}

@Entity()
export class ImportTransaction extends BaseSoftDeletableEntity {
  @Column({ type: 'enum', enum: ImportSource })
  importSource!: ImportSource;

  @Column({ type: 'enum', enum: ImportType })
  importType!: ImportType;

  @Column({ type: 'enum', enum: ImportStatus, default: ImportStatus.Pending })
  importStatus!: ImportStatus;

  @Column({ type: 'text', nullable: true })
  importedFileUrl?: string;

  @Column({ type: 'text', nullable: true })
  importedFileName?: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importedFileId?: string;

  @OneToOne(() => File, { cascade: ['insert', 'soft-remove'], nullable: true })
  @JoinColumn()
  importedFile?: File;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.importTransactions, {
    nullable: true,
  })
  importedUser?: User;

  @OneToMany(() => ProductSchedule, (entity) => entity.importTransaction, {
    cascade: true,
  })
  productSchedules: ProductSchedule[];

  @OneToMany(() => CleaningPlan, (entity) => entity.importTransaction)
  cleaningPlans: CleaningPlan[];

  @OneToMany(() => CleaningRoomHistory, (entity) => entity.importTransaction)
  cleaningRoomHistories: CleaningRoomHistory[];

  @OneToMany(() => SwabTest, (entity) => entity.importTransaction)
  swabTests: SwabTest[];
}
