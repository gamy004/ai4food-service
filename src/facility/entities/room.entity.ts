import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { FacilityItem } from "./facility-item.entity";
import { Zone } from "./zone.entity";

@Entity()
@Index(["roomName", "zone"], { unique: true })
export class Room extends BaseSoftDeletableEntity {
    @Column()
    roomName!: string;

    @Column({ type: "varchar", length: 36, nullable: true })
    zoneId?: string;

    @ManyToOne(() => Zone, entity => entity.rooms, { onDelete: "SET NULL" })
    zone?: Zone;

    @OneToMany(() => FacilityItem, entity => entity.room)
    facilityItems: FacilityItem[];
}