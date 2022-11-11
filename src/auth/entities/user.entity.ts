import { Entity, Column, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from '../../common/entities/base-softdeletable.entity';
import { ImportTransaction } from '../../import-transaction/entities/import-transaction.entity';
import { File } from '../../common/entities/file.entity';
import { SwabTest } from '../../swab/entities/swab-test.entity';
import { SwabAreaHistory } from '../../swab/entities/swab-area-history.entity';
import { SwabProductHistory } from '../../swab/entities/swab-product-history.entity';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserTeam {
    ADMIN = 'admin',
    QA = 'qa',
    SWAB = 'swab',
    LAB = 'lab',
    PRODUCTION = 'production'
}

@Entity()
export class User extends BaseSoftDeletableEntity {
    @Column()
    userName!: string;

    @Column({ nullable: true })
    email?: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    firstName?: string;

    @Column({ nullable: true })
    lastName?: string;

    @Column({ type: "enum", enum: UserRole })
    role = UserRole.USER;

    @Column({ type: "enum", enum: UserTeam })
    team: UserTeam;

    @OneToMany(() => ImportTransaction, importTransaction => importTransaction.importedUser, { cascade: true })
    importTransactions: ImportTransaction[];

    @OneToMany(() => File, entity => entity.user)
    files: File[];

    @OneToMany(() => SwabTest, entity => entity.recordedUser)
    recordedSwabTests: SwabTest[];

    @OneToMany(() => SwabAreaHistory, entity => entity.recordedUser)
    recordedSwabAreaHistories: SwabAreaHistory[];

    @OneToMany(() => SwabProductHistory, entity => entity.recordedUser)
    recordedSwabProductHistories: SwabProductHistory[];
}
