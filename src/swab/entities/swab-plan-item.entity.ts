import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabPlan } from './swab-plan.entity';
import { SwabArea } from './swab-area.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { SwabAreaHistory } from './swab-area-history.entity';

@Entity()
export class SwabPlanItem extends BaseSoftDeletableEntity {
  @Column({ type: 'integer', default: 0 })
  order!: number;

  @Column({ type: 'varchar', length: 36 })
  swabAreaId!: string;

  @ManyToOne(() => SwabArea, (entity) => entity.swabPlanItems, {
    onDelete: 'CASCADE',
  })
  swabArea: SwabArea;

  @Column({ type: 'varchar', length: 36 })
  swabPlanId!: string;

  @ManyToOne(() => SwabPlan, (entity) => entity.swabPlanItems, {
    onDelete: 'CASCADE',
  })
  swabPlan: SwabPlan;

  @Column({ type: 'varchar', length: 36 })
  facilityItemId!: string;

  @ManyToOne(() => FacilityItem, (entity) => entity.swabPlanItems, {
    onDelete: 'CASCADE',
  })
  facilityItem: FacilityItem;

  @Column({ type: 'varchar', length: 36, nullable: true })
  swabAreaHistoryId?: string;

  @ManyToOne(() => SwabAreaHistory, (entity) => entity.swabPlanItems, {
    onDelete: 'SET NULL',
  })
  swabAreaHistory: SwabAreaHistory;
}
