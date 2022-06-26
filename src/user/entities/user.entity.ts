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
    PRODUCTION = 'production',
    WORKER = 'worker'
}

@Entity()
export class User extends BaseSoftDeletableEntity {
    @Column()
    userName!: String;

    @Column()
    email!: String;

    @Column()
    password!: String;

    @Column()
    firstName!: String;

    @Column()
    lastName!: String;

    @Column({ type: "enum", enum: UserRole })
    role = UserRole.USER;

    @Column({ type: 'enum', enum: UserTeam, array: true })
    teams = [];
}
