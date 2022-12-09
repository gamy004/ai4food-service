import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { BaseSoftDeletableEntity } from '../../common/entities/base-softdeletable.entity';
import { Shift } from '../../common/enums/shift';
import { FacilityItem } from '../../facility/entities/facility-item.entity';
import { Product } from '../../product/entities/product.entity';
import { SwabAreaHistoryImage } from './swab-area-history-image.entity';
import { SwabArea } from './swab-area.entity';
import { SwabEnvironment } from './swab-environment.entity';
import { SwabPeriod } from './swab-period.entity';
import { SwabRound } from './swab-round.entity';
import { SwabTest } from './swab-test.entity';

@Entity()
export class SwabAreaHistory extends BaseSoftDeletableEntity {
  @Column({ type: 'date' })
  swabAreaDate!: Date;

  @Column({ type: 'time', nullable: true })
  swabAreaSwabedAt?: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  swabAreaTemperature?: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  swabAreaHumidity?: number;

  @Column({ type: 'integer', nullable: true })
  swabAreaAtp?: number;

  @Column({ type: 'text', nullable: true })
  swabAreaNote?: string;

  @Column({ type: 'varchar', length: 36 })
  swabPeriodId!: string;

  @ManyToOne(() => SwabPeriod, (entity) => entity.swabAreaHistories)
  swabPeriod: SwabPeriod;

  @Column({ type: 'varchar', length: 36 })
  swabAreaId!: string;

  @ManyToOne(() => SwabArea, (entity) => entity.swabAreaHistories)
  swabArea: SwabArea;

  @OneToMany(() => SwabAreaHistoryImage, (entity) => entity.swabAreaHistory, {
    cascade: ['insert', 'update'],
  })
  swabAreaHistoryImages: SwabAreaHistoryImage[];

  @Column({ nullable: true })
  swabTestId?: number;

  @OneToOne(() => SwabTest, { cascade: ['insert', 'soft-remove'] })
  @JoinColumn()
  swabTest?: SwabTest;

  @Column({ type: 'enum', enum: Shift, nullable: true })
  shift?: Shift;

  @ManyToMany(() => SwabEnvironment, { cascade: ['insert', 'update'] })
  @JoinTable()
  swabEnvironments: SwabEnvironment[];

  @Column({ type: 'varchar', length: 36, nullable: true })
  productId?: string;

  @ManyToOne(() => Product, (entity) => entity.swabAreaHistories)
  product?: Product;

  @Column({ type: 'date', nullable: true })
  productDate?: Date;

  @Column({ nullable: true })
  productLot?: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  facilityItemId?: string;

  @ManyToOne(() => FacilityItem, (entity) => entity.swabAreaHistories, {
    onDelete: 'SET NULL',
  })
  facilityItem?: FacilityItem;

  @Column({ type: 'varchar', length: 36, nullable: true })
  recordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabAreaHistories, {
    onDelete: 'SET NULL',
  })
  recordedUser: User;

  @Column({ nullable: true })
  swabRoundId: number;

  @ManyToOne(() => SwabRound, (entity) => entity.swabAreaHistories)
  @JoinColumn()
  swabRound?: SwabRound;

  @Column({ type: 'varchar', length: 36, nullable: true })
  mainSwabAreaHistoryId?: string;

  @ManyToOne(() => SwabAreaHistory, (entity) => entity.subSwabAreaHistories)
  mainSwabAreaHistory?: SwabAreaHistory;

  @OneToMany(() => SwabAreaHistory, (entity) => entity.mainSwabAreaHistory, {
    cascade: ['insert', 'soft-remove'],
  })
  subSwabAreaHistories: SwabAreaHistory[];
}
