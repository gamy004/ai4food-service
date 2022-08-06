import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableIncrementEntity } from "~/common/entities/base-softdeletable-increment.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabRound extends BaseSoftDeletableIncrementEntity {
    @Column({ type: "varchar", length: 255 })
    swabRoundNumber: string;

    @OneToMany(() => SwabAreaHistory, entity => entity.swabRound)
    swabAreaHistories: SwabAreaHistory[];
}
