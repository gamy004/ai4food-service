import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabAreaHistoryImage extends BaseSoftDeletableEntity {
    @Column({ type: 'text' })
    swabAreaHistoryImageUrl!: string;

    @Column({ type: 'text', nullable: true })
    swabAreaHistoryImageDescription?: string;

    @Column({ nullable: true })
    swabAreaHistoryId: string;

    @ManyToOne(() => SwabAreaHistory, entity => entity.swabAreaHistoryImages)
    swabAreaHistory: SwabAreaHistory;
}
