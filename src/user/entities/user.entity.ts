import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';

import { Entity, Column } from "typeorm";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserTeam {
    ADMIN = 'admin',
    QA = 'qa',
    LAB = 'lab',
    PRODUCTION = 'production'
}

@Entity()
export class User extends BaseSoftDeletableEntity {
    @Column()
    userName!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ type: "enum", enum: UserRole })
    role = UserRole.USER;
}
