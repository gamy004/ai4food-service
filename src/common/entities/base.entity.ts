import { BaseEntity as TypeOrmBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn()
    createdAt: Date = new Date();

    @UpdateDateColumn()
    updatedAt: Date = new Date();
}
