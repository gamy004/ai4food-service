import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { User } from "~/auth/entities/user.entity";
import { SwabAreaHistoryImage } from "~/swab/entities/swab-area-history-image.entity";
import { BaseSoftDeletableEntity } from "./base-softdeletable.entity";

@Entity()
export class File extends BaseSoftDeletableEntity {
    @Column({ type: 'text' })
    fileKey!: string;

    @Column()
    fileName!: string;

    @Column({ type: 'text' })
    fileSource!: string;

    @Column()
    fileContentType!: string;

    @Column()
    fileSize!: number;

    @ManyToOne(() => User, entity => entity.files, { onDelete: 'SET NULL' })
    user: User;
}
