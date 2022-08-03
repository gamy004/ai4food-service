import { Column, Entity } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";

@Entity()
export class Bacteria extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    bacteriaName: string;
}
