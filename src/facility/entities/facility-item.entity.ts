import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SensorMapping } from '~/iot/entities/sensor-mapping.entity';
import { SwabAreaHistory } from '~/swab/entities/swab-area-history.entity';
import { SwabProductHistory } from '~/swab/entities/swab-product-history.entity';
import { Facility } from './facility.entity';
import { Room } from './room.entity';
import { Zone } from './zone.entity';

@Entity()
export class FacilityItem extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  facilityItemName: string;

  @Column({ type: 'varchar', length: 36 })
  facilityId: string;

  @ManyToOne(() => Facility, (entity) => entity.facilityItems, {
    onDelete: 'CASCADE',
  })
  facility: Facility;

  @Column({ type: 'varchar', length: 36, nullable: true })
  roomId: string;

  @ManyToOne(() => Room, (entity) => entity.facilityItems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  room: Room;

  @Column({ type: 'varchar', length: 36, nullable: true })
  zoneId: string;

  @ManyToOne(() => Zone, (entity) => entity.facilityItems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  zone: Zone;

  @OneToMany(() => SwabAreaHistory, (entity) => entity.facilityItem)
  swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabProductHistory, (entity) => entity.facilityItem)
  swabProductHistories: SwabProductHistory[];

  @OneToMany(() => SensorMapping, (entity) => entity.facilityItem)
  sensorMappings: SensorMapping[];
}
