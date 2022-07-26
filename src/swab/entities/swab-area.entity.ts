import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { FacilityItem } from "~/facility/entities/facility-item.entity";
import { Facility } from "~/facility/entities/facility.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabArea extends BaseSoftDeletableEntity {
    @Column()
    swabAreaName!: string;

    @Column({ nullable: true })
    mainSwabAreaId?: string;

    @ManyToOne(() => SwabArea, entity => entity.subSwabAreas, { nullable: true })
    mainSwabArea?: SwabArea;

    @OneToMany(() => SwabArea, entity => entity.mainSwabArea, { cascade: true })
    subSwabAreas: SwabArea[];

    @OneToMany(() => SwabAreaHistory, entity => entity.swabArea)
    swabAreaHistories: SwabAreaHistory[];

    // @Column({ nullable: true })
    // facilityItemId: string;

    // @ManyToOne(() => FacilityItem, entity => entity.swabAreas, { nullable: true })
    // facilityItem?: FacilityItem;

    @Column({ nullable: true })
    facilityId: string;

    @ManyToOne(() => Facility, entity => entity.swabAreas, { nullable: true })
    facility?: Facility;
}
