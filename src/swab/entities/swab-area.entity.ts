import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { FacilityItem } from "~/facility/entities/facility-item.entity";
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

    @ManyToOne(() => FacilityItem, entity => entity.swabAreas, { nullable: true })
    facilityItem?: FacilityItem;
}
