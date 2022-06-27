import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { ProductSchedule } from "~/product-schedule/entities/product-schedule.entity";

@Entity()
export class Product extends BaseSoftDeletableEntity {
    @Column({ length: 8, unique: true })
    productCode!: string;

    @Column()
    productName!: string;

    @OneToMany(() => ProductSchedule, (entity) => entity.product)
    productSchedules: ProductSchedule[];
}
