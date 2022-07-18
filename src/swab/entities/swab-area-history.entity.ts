import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { Shift } from "~/common/enums/shift";
import { SwabAreaImage } from "./swab-area-image.entity";
import { SwabArea } from "./swab-area.entity";
import { SwabPeriod } from "./swab-period.entity";
import { SwabTest } from "./swab-test.entity";

@Entity()
export class SwabAreaHistory extends BaseSoftDeletableEntity {
    @Column({ type: 'date' })
    swabAreaDate!: Date;

    @Column({ type: 'time', nullable: true })
    swabAreaSwabedAt?: Date;

    @Column({ type: 'decimal', precision: 2, nullable: true })
    swabAreaTemperature?: number;

    @Column({ type: 'decimal', precision: 2, nullable: true })
    swabAreaHumidity?: number;

    @Column({ type: 'integer', nullable: true })
    swabAreaAtp?: number;

    @Column({ nullable: true })
    swabPeriodId: string;

    @ManyToOne(() => SwabPeriod, entity => entity.swabAreaHistories)
    swabPeriod: SwabPeriod;

    @Column({ nullable: true })
    swabAreaId: string;

    @ManyToOne(() => SwabArea, entity => entity.swabAreaHistories)
    swabArea: SwabArea;

    @OneToMany(() => SwabAreaImage, entity => entity.swabAreaHistory)
    swabAreaImages: SwabAreaImage[];

    @Column({ nullable: true })
    swabTestId: number;

    @OneToOne(() => SwabTest, { cascade: ['insert', 'soft-remove'] })
    @JoinColumn()
    swabTest: SwabTest;

    @Column({ type: "enum", enum: Shift, nullable: true })
    shift?: Shift;
}
