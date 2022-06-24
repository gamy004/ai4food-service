import { v4 } from 'uuid';
import { PrimaryKey, Entity, Property, BaseEntity as MikroOrmBaseEntity } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class BaseEntity<
    T,
    PK extends keyof T,
    > extends MikroOrmBaseEntity<T, PK> {
    @PrimaryKey()
    id: string = v4();

    @Property()
    createdAt: Date = new Date();

    @Property()
    updatedAt: Date = new Date();
}
