import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { User } from "~/auth/entities/user.entity";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { Shift } from "~/common/enums/shift";
import { FacilityItem } from "~/facility/entities/facility-item.entity";
import { Product } from "~/product/entities/product.entity";
import { SwabPeriod } from "./swab-period.entity";
import { SwabTest } from "./swab-test.entity";

@Entity()
export class SwabProductHistory extends BaseSoftDeletableEntity {
    @Column({ type: "varchar", length: 36 })
    productId!: string;

    @ManyToOne(() => Product, entity => entity.swabProductHistories)
    product!: Product;

    @Column()
    swabProductLot!: string;

    @Column({ type: "enum", enum: Shift, nullable: true })
    shift?: Shift;

    @Column({ type: 'date' })
    swabProductDate!: Date;

    @Column({ type: 'time', nullable: true })
    swabProductSwabedAt?: string;

    @Column()
    swabTestId!: number;

    @OneToOne(() => SwabTest, { cascade: ['insert', 'soft-remove'] })
    @JoinColumn()
    swabTest!: SwabTest;

    @Column({ type: "varchar", length: 36, nullable: true })
    recordedUserId?: string;

    @ManyToOne(() => User, entity => entity.recordedSwabProductHistories, { onDelete: 'SET NULL' })
    recordedUser: User;

    @Column({ type: "varchar", length: 36 })
    swabPeriodId!: string;

    @ManyToOne(() => SwabPeriod, entity => entity.swabProductHistories)
    swabPeriod: SwabPeriod;

    @Column({ type: "varchar", length: 36, nullable: true })
    facilityItemId?: string;

    @ManyToOne(() => FacilityItem, entity => entity.swabProductHistories, { onDelete: 'SET NULL' })
    facilityItem?: FacilityItem;
}
