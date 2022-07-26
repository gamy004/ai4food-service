import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { Shift } from "~/common/enums/shift";
import { FacilityItem } from "~/facility/entities/facility-item.entity";
import { Product } from "~/product/entities/product.entity";
import { SwabAreaHistoryImage } from "./swab-area-history-image.entity";
import { SwabArea } from "./swab-area.entity";
import { SwabEnvironment } from "./swab-environment.entity";
import { SwabPeriod } from "./swab-period.entity";
import { SwabTest } from "./swab-test.entity";

@Entity()
export class SwabAreaHistory extends BaseSoftDeletableEntity {
    @Column({ type: 'date' })
    swabAreaDate!: Date;

    @Column({ type: 'time', nullable: true })
    swabAreaSwabedAt?: string;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    swabAreaTemperature?: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    swabAreaHumidity?: number;

    @Column({ type: 'integer', nullable: true })
    swabAreaAtp?: number;

    @Column({ type: 'text', nullable: true })
    swabAreaNote?: string;

    @Column({ nullable: true })
    swabPeriodId: string;

    @ManyToOne(() => SwabPeriod, entity => entity.swabAreaHistories)
    swabPeriod: SwabPeriod;

    @Column({ nullable: true })
    swabAreaId: string;

    @ManyToOne(() => SwabArea, entity => entity.swabAreaHistories)
    swabArea: SwabArea;

    @OneToMany(() => SwabAreaHistoryImage, entity => entity.swabAreaHistory, { cascade: ['insert', 'update'] })
    swabAreaHistoryImages: SwabAreaHistoryImage[];

    @Column({ nullable: true })
    swabTestId: number;

    @OneToOne(() => SwabTest, { cascade: ['insert', 'soft-remove'] })
    @JoinColumn()
    swabTest: SwabTest;

    @Column({ type: "enum", enum: Shift, nullable: true })
    shift?: Shift;

    @ManyToMany(() => SwabEnvironment, { cascade: ['insert', 'update'] })
    @JoinTable()
    swabEnvironments: SwabEnvironment[];

    @Column({ nullable: true })
    productId: string;

    @ManyToOne(() => Product, entity => entity.swabAreaHistories)
    product: Product;

    @Column({ type: 'date', nullable: true })
    productDate: Date;

    @Column({ nullable: true })
    productLot: string;

    @Column({ nullable: true })
    facilityItemId: string;

    @ManyToOne(() => FacilityItem, entity => entity.swabAreaHistories)
    facilityItem: FacilityItem;
}
