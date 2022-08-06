import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { User } from "~/auth/entities/user.entity";
import { BaseSoftDeletableIncrementEntity } from "~/common/entities/base-softdeletable-increment.entity";
import { BacteriaSpecie } from "~/lab/entities/bacteria-specie.entity";
import { Bacteria } from "~/lab/entities/bacteria.entity";

export const SWAB_TEST_CODE_PREFIX = "AI";
@Entity()
export class SwabTest extends BaseSoftDeletableIncrementEntity {
    @Column({ unique: true })
    swabTestCode: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    swabTestRecordedAt: Date;

    @Column({ nullable: true })
    recordedUserInd?: string;

    @ManyToOne(() => User, entity => entity.recordedSwabTests, { onDelete: 'SET NULL' })
    recordedUser: User;

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
