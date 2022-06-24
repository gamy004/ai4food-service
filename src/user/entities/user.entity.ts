import { v4 } from 'uuid';
import { PrimaryKey, Entity, Property } from '@mikro-orm/core';

@Entity()
export class User {
    @PrimaryKey()
    id = v4();

    @Property()
    firstName:string;

    @Property()
    lastName:string;
}
