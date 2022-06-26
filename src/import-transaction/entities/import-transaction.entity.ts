import { Column, Entity, ManyToOne } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { User } from "~/user/entities/user.entity";

export enum ImportType {
    PRODUCT_SCHEDULE = 'productSchedule',
    CLEANING_PLAN = 'cleaningPlan',
}

@Entity()
export class ImportTransaction extends BaseSoftDeletableEntity {
    @Column()
    transactionNumber!: string;

    @Column({ type: "enum", enum: ImportType, nullable: true })
    importType?: string;

    @ManyToOne(() => User, (user) => user.importTransactions, { nullable: true })
    importedUser?: User;
}