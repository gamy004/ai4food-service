import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { User } from "~/auth/entities/user.entity";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { ProductSchedule } from "~/product-schedule/entities/product-schedule.entity";

export enum ImportSource {
    WEB = 'web',
    OPERATOR = 'operator'
}

export enum ImportType {
    PRODUCTION_SCHEDULE = 'production_schedule',
    CLEANING_PLAN = 'cleaning_plan',
    CLEANING_ROOM_HISTORY = 'cleaning_room_history'
}

export enum ImportStatus {
    Pending = 'pending',
    Success = 'success',
    Cancel = 'cancel'
}

@Entity()
export class ImportTransaction extends BaseSoftDeletableEntity {
    @Column({ type: "enum", enum: ImportSource, nullable: false })
    importSource: ImportSource;

    @Column({ type: "enum", enum: ImportType, nullable: false })
    importType: ImportType;

    @Column({ type: "enum", enum: ImportStatus, default: ImportStatus.Pending })
    importStatus: ImportStatus;

    @Column({ type: "text" })
    importedFileUrl?: string;

    @Column({ type: "text" })
    importedFileName?: string;

    @ManyToOne(() => User, entity => entity.importTransactions, { nullable: true })
    importedUser?: User;

    @OneToMany(() => ProductSchedule, entity => entity.importTransaction, { cascade: true })
    productSchedules: ProductSchedule[];
}