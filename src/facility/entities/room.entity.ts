import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { CleaningRoomHistory } from '~/cleaning/entities/cleaning-room-history.entity';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { FacilityItem } from './facility-item.entity';
import { RiskZone } from './risk-zone.entity';
import { Zone } from './zone.entity';

@Entity()
@Index(['roomName', 'zone'], { unique: true })
export class Room extends BaseSoftDeletableEntity {
  @Column()
  roomName!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  zoneId?: string;

  @ManyToOne(() => Zone, (entity) => entity.rooms, { onDelete: 'SET NULL' })
  zone?: Zone;

  @Column({ type: 'varchar', length: 36, nullable: true })
  riskZoneId?: string;

  @ManyToOne(() => RiskZone, (entity) => entity.rooms, { onDelete: 'SET NULL' })
  riskZone?: RiskZone;

  @OneToMany(() => FacilityItem, (entity) => entity.room)
  facilityItems: FacilityItem[];

  @OneToMany(() => CleaningRoomHistory, (entity) => entity.room)
  cleaningRoomHistories?: CleaningRoomHistory;
}
