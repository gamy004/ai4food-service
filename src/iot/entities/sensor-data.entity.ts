import {
  BaseEntity as TypeOrmBaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  PrimaryColumn,
  Entity,
} from 'typeorm';

@Entity()
export class SensorData extends TypeOrmBaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  nodeNo: string;

  @PrimaryColumn({ type: 'datetime' })
  timeSend?: Date;

  @Column({ type: 'float', nullable: true })
  temperature?: number;

  @Column({ type: 'float', nullable: true })
  boxTemperature?: number;

  @Column({ type: 'float', nullable: true })
  humidity?: number;

  @Column({ type: 'float', nullable: true })
  boxHumidity?: number;

  @Column({ type: 'float', nullable: true })
  vibration?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_1_2?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_3_4?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_5_6?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_7_8?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_9_10?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_11_12?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_13_14?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_15_16?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_17_18?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_19_20?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_21_22?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  pixelRows_23_24?: string;

  @CreateDateColumn()
  timestamp: Date;
}
