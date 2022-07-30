import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';

import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';
import { File } from '~/common/entities/file.entity';

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
}
