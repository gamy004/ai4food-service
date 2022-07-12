import { Column, Entity, OneToMany, Generated } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabAreaImage } from "./swab-area-image.entity";

@Entity()
export class SwabAreaHistory extends BaseSoftDeletableEntity {
    @Column({ type: 'time' })
    swabAreaSwabedAt: Date;

    @Generated('increment')
    swabAreaLabNo: string;

    @Column({ type: 'decimal', precision: 2 })
    swabAreaTemperature?: number;

    @Column({ type: 'decimal', precision: 2 })
    swabAreaHumidityPercent?: number;

    @Column({ type: 'integer' })
    swabAreaAtpValue?: number;

    @OneToMany(() => SwabAreaImage, (entity) => entity.swabAreaHistory)
    swabAreaImages: SwabAreaImage[];
}
