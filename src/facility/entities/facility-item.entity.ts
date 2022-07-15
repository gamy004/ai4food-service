import { Column, ManyToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { Facility } from "./facility.entity";

export class FacilityItem extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    facilityItemName!: string;

    @ManyToOne(() => Facility, entity => entity.facilityItems)
    facility: Facility;
}