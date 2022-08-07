import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { BacteriaSpecie } from "./bacteria-specie.entity";

@Entity()
export class Bacteria extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    bacteriaName: string;

    @OneToMany(() => BacteriaSpecie, entity => entity.bacteria, { cascade: true })
    bacteriaSpecies: BacteriaSpecie[];
}
