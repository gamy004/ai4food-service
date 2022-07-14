import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabAreaImage extends BaseSoftDeletableEntity {
    @Column({ type: 'text' })
    swabAreaImageUrl!: string;

    @Column({ type: 'text', nullable: true })
    swabAreaImageDescription?: string;

    @ManyToOne(() => SwabAreaHistory, entity => entity.swabAreaImages)
    swabAreaHistory: SwabAreaHistory;
}
