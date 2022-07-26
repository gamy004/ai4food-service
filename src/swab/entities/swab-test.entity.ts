import { AfterInsert, Column, Entity, Index } from "typeorm";
import { BaseSoftDeletableIncrementEntity } from "~/common/entities/base-softdeletable-increment.entity";

export const SWAB_TEST_CODE_PREFIX = "AI";
@Entity()
export class SwabTest extends BaseSoftDeletableIncrementEntity {

    @Index()
    @Column({ nullable: true })
    swabTestCode?: string;

    @Column({ type: 'boolean', nullable: true })
    listeriaMonoDetected?: boolean;

    @Column({ type: 'float', nullable: true })
    listeriaMonoValue?: number;

    // @AfterInsert()
    // generateSwabTestNo() {
    //     SwabTest.update(this.id, {
    //         swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${this.id}`
    //     });
    // }
}
