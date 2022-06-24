import { Entity, Property } from '@mikro-orm/core';
import { SoftDeletable } from 'mikro-orm-soft-delete';
import { BaseEntity } from './base.entity';

@Entity({ abstract: true })
export abstract class AbstractBaseSoftDeletableEntity<
    T,
    PK extends keyof T,
    > extends BaseEntity<T, PK> {
    @Property({ nullable: true })
    deletedAt?: Date;
}

@Entity({ abstract: true })
@SoftDeletable(() => BaseSoftDeletableEntity, "deletedAt", () => new Date())
export class BaseSoftDeletableEntity<
    T,
    PK extends keyof T,
    > extends AbstractBaseSoftDeletableEntity<T, PK> {

}
