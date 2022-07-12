import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { ProductSchedule } from "~/product-schedule/entities/product-schedule.entity";

@Entity()
export class SwabAreaHistory extends BaseSoftDeletableEntity {

}
