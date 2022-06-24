import { v4 } from "uuid";
import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
// import { SoftDeletable } from 'mikro-orm-soft-delete';
// import { BaseEntity } from '~/common/entities/base.entity';
import { BaseSoftDeletableEntity } from '../../common/entities/base-softdeletable.entity';

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
export class User extends BaseSoftDeletableEntity<User, "id"> {
    @Property()
    userName!: String;

    @Property()
    email!: String;

    @Property()
    password!: String;

    @Property()
    firstName!: String;

    @Property()
    lastName!: String;

    @Enum(() => UserRole)
    role = UserRole.USER;

    @Enum({ items: () => UserTeam, array: true })
    teams = [];
}
