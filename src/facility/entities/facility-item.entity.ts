import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabArea } from "~/swab/entities/swab-area.entity";
import { Facility } from "./facility.entity";
import { Room } from "./room.entity";
import { Zone } from "./zone.entity";

@Entity()
export class FacilityItem extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    facilityItemName!: string;

    @ManyToOne(() => Facility, entity => entity.facilityItems, { onDelete: 'CASCADE' })
    facility: Facility;

    @ManyToOne(() => Room, entity => entity.facilityItems, { nullable: true, onDelete: 'SET NULL' })
    room?: Room;

    @ManyToOne(() => Zone, entity => entity.facilityItems, { nullable: true, onDelete: 'SET NULL' })
    zone?: Zone;

    @OneToMany(() => SwabArea, entity => entity.facilityItem)
    swabAreas: SwabArea[];
}