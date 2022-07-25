import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { ProductSchedule } from "~/product-schedule/entities/product-schedule.entity";
import { SwabAreaHistory } from "~/swab/entities/swab-area-history.entity";
import { SwabProductHistory } from "~/swab/entities/swab-product-history.entity";

@Entity()
export class Product extends BaseSoftDeletableEntity {
    @Column({ length: 8, unique: true })
    productCode!: string;

    @Column({ length: 8, unique: true })
    alternateProductCode!: string;

    @Column()
    productName!: string;

    @OneToMany(() => ProductSchedule, entity => entity.product)
    productSchedules: ProductSchedule[];

    @OneToMany(() => SwabAreaHistory, entity => entity.product)
    swabAreaHistories: SwabAreaHistory[];

    @OneToMany(() => SwabProductHistory, entity => entity.product)
    swabProductHistories: SwabProductHistory[];


}
