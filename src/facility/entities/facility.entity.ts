import { Column, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { FacilityItem } from "./facility-item.entity";

export enum FacilityType {
    MACHINE = 'machine',
    VERHICAL = 'vehical',
    TOOL = 'tool'
}

export class Facility extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    facilityName!: string;

    @Column({ type: "enum", enum: FacilityType })
    facilityType: FacilityType;

    @OneToMany(() => FacilityItem, entity => entity.facility)
    facilityItems: FacilityItem[];
}