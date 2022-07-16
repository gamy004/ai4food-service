
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabPeriod extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    swabPeriodName!: string;

    @OneToMany(() => SwabAreaHistory, entity => entity.swabPeriod)
    swabAreaHistories: SwabAreaHistory[];
}
