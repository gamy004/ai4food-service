import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { Shift } from "~/common/enums/shift";
import { Product } from "~/product/entities/product.entity";
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
}
