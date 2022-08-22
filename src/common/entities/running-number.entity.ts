import { Column, Entity } from "typeorm";
import { BaseSoftDeletableEntity } from "./base-softdeletable.entity";

@Entity()
export class RunningNumber extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    key!: string;

    @Column()
    latestRunningNumber!: number;
}
