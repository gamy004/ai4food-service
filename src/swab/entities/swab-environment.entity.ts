import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableIncrementEntity } from "~/common/entities/base-softdeletable-increment.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabEnvironment extends BaseSoftDeletableIncrementEntity {

    @Column({ unique: true })
    swabEnvironmentName!: string;

    @OneToMany(() => SwabAreaHistory, entity => entity.swabEnvironment)
    swabAreaHistories: SwabAreaHistory[];
}
