import { Column, Entity } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";

@Entity()
export class SwabPeriod extends BaseSoftDeletableEntity {
    @Column()
    swabPeriodName!: string;

    @Column()
    swabPeriodType!: string;
}
