import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { File } from "~/common/entities/file.entity";
import { SwabAreaHistory } from "./swab-area-history.entity";

@Entity()
export class SwabAreaHistoryImage extends BaseSoftDeletableEntity {
    @Column({ type: 'text', nullable: true })
    swabAreaHistoryImageDescription?: string;

    @Column({ nullable: true })
    swabAreaHistoryId: string;

    @ManyToOne(() => SwabAreaHistory, entity => entity.swabAreaHistoryImages)
    swabAreaHistory: SwabAreaHistory;

    @OneToOne(() => File, { cascade: ['insert', 'update', 'soft-remove'] })
    @JoinColumn()
    file: File;
}
