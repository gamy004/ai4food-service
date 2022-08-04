import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseSoftDeletableIncrementEntity } from "~/common/entities/base-softdeletable-increment.entity";
import { BacteriaSpecie } from "~/lab/entities/bacteria-specie.entity";
import { Bacteria } from "~/lab/entities/bacteria.entity";

export const SWAB_TEST_CODE_PREFIX = "AI";
@Entity()
export class SwabTest extends BaseSoftDeletableIncrementEntity {
    @Column({ unique: true })
    swabTestCode: string;

    @Column({ type: 'boolean', nullable: true })
    listeriaMonoDetected: boolean;

    @Column({ type: 'float', nullable: true })
    listeriaMonoValue: number;

    @ManyToMany(() => Bacteria, { cascade: ['insert', 'update'] })
    @JoinTable()
    bacteria!: Bacteria[];

    @ManyToMany(() => BacteriaSpecie, { cascade: ['insert', 'update'] })
    @JoinTable()
    bacteriaSpecies!: BacteriaSpecie[];
    // @AfterInsert()
    // generateSwabTestNo() {
    //     SwabTest.update(this.id, {
    //         swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${this.id}`
    //     });
    // }
}
