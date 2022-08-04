import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { Bacteria } from "./bacteria.entity";

@Entity()
export class BacteriaSpecie extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    bacteriaSpecieName: string;

    @Column({ type: "varchar", length: 36 })
    bacteriaId!: string;

    @ManyToOne(() => Bacteria, entity => entity.bacteriaSpecies)
    bacteria: Bacteria;
}
