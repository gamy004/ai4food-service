import { BaseEntity as TypeOrmBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, Column, PrimaryColumn } from 'typeorm';

export class SensorData extends TypeOrmBaseEntity {
    @PrimaryColumn()
    @Column({ type: "varchar", length: 36, nullable: false })
    node_id: number;

    @PrimaryColumn()
    @Column({ type: "datetime", nullable: true })
    time_send: string;

    @CreateDateColumn()
    timestamp: Date;
}