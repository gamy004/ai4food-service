import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { User } from "~/auth/entities/user.entity";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { ProductSchedule } from "~/product-schedule/entities/product-schedule.entity";

export enum ImportType {
    PRODUCTION_SCHEDULE = 'production_schedule',
    CLEANING_PLAN = 'cleaning_plan',
    CLEANING_ROOM_HISTORY = 'cleaning_room_history'
}

@Entity()
export class ImportTransaction extends BaseSoftDeletableEntity {
    @Column()
    transactionNumber!: string;

    @Column({ type: "enum", enum: ImportType, nullable: true })
    importType?: string;

    @ManyToOne(() => User, entity => entity.importTransactions, { nullable: true })
    importedUser?: User;

    @OneToMany(() => ProductSchedule, entity => entity.importTransaction, { cascade: true })
    productSchedules: ProductSchedule[];
}