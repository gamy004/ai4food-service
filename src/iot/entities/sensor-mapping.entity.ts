import {
  BaseEntity as TypeOrmBaseEntity,
  Column,
  PrimaryColumn,
  Entity,
  ManyToOne,
} from 'typeorm';
import { FacilityItem } from '~/facility/entities/facility-item.entity';

@Entity()
export class SensorMapping extends TypeOrmBaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  nodeNo: string;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  facilityItemId: string;

  @ManyToOne(() => FacilityItem, (entity) => entity.sensorMappings, {
    onDelete: 'CASCADE',
  })
  facilityItem: FacilityItem;
}
