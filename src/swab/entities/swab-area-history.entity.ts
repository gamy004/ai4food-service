import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabAreaImage } from "./swab-area-image.entity";
import { SwabArea } from "./swab-area.entity";
import { SwabTest } from "./swab-test.entity";

@Entity()
export class SwabAreaHistory extends BaseSoftDeletableEntity {
    @Column({ type: 'date' })
    swabAreaDate!: Date;

    @Column({ type: 'time', nullable: true })
    swabAreaSwabedAt?: Date;

    @Column({ type: 'decimal', precision: 2 })
    swabAreaTemperature?: number;

    @Column({ type: 'decimal', precision: 2 })
    swabAreaHumidity?: number;

    @Column({ type: 'integer' })
    swabAreaAtp?: number;

    @ManyToOne(() => SwabArea, entity => entity.swabAreaHistories)
    swabArea: SwabArea;

    @OneToMany(() => SwabAreaImage, entity => entity.swabAreaHistory)
    swabAreaImages: SwabAreaImage[];

    @OneToOne(() => SwabTest, { cascade: ['insert', 'soft-remove'] })
    @JoinColumn()
    swabTest: SwabTest;
}
