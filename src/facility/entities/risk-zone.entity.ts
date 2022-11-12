import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { FacilityItem } from "./facility-item.entity";
import { Room } from "./room.entity";

@Entity()
export class RiskZone extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    riskZoneName!: string;

    @OneToMany(() => Room, entity => entity.riskZone, { cascade: ["insert", "update"] })
    rooms: Room[];

    @OneToMany(() => FacilityItem, entity => entity.riskZone)
    facilityItems: FacilityItem[];
}