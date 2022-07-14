import { BaseEntity as TypeOrmBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseIncrementEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    id: string | number;

    @CreateDateColumn()
    createdAt: Date = new Date();

    @UpdateDateColumn()
    updatedAt: Date = new Date();
}
