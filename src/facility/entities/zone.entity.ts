import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { FacilityItem } from "./facility-item.entity";
import { Room } from "./room.entity";

@Entity()
export class Zone extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    zoneName!: string;

    @OneToMany(() => Room, entity => entity.zone, { cascade: ["insert", "update"] })
    rooms: Room[];

    @OneToMany(() => FacilityItem, entity => entity.zone)
    facilityItems: FacilityItem[];
}