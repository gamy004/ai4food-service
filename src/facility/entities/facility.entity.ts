import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabArea } from "~/swab/entities/swab-area.entity";
import { FacilityItem } from "./facility-item.entity";

export enum FacilityType {
    MACHINE = 'machine',
    VERHICAL = 'vehical',
    TOOL = 'tool'
}

@Entity()
export class Facility extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    facilityName!: string;

    @Column({ type: "enum", enum: FacilityType })
    facilityType!: FacilityType;

    @OneToMany(() => FacilityItem, entity => entity.facility, { cascade: true })
    facilityItems: FacilityItem[];

    @OneToMany(() => SwabArea, entity => entity.facility)
    swabAreas: SwabArea[];
}