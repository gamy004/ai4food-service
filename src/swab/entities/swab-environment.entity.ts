import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabEnvironment extends BaseSoftDeletableEntity {

    @Column({ unique: true })
    swabEnvironmentName!: string;

    @OneToMany(() => SwabAreaHistory, entity => entity.swabEnvironment)
    swabAreaHistories: SwabAreaHistory[];
}
