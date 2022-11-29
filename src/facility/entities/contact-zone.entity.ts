import { Column, Entity, OneToMany } from "typeorm";
import { BaseSoftDeletableEntity } from "~/common/entities/base-softdeletable.entity";
import { SwabArea } from "~/swab/entities/swab-area.entity";

@Entity()
export class ContactZone extends BaseSoftDeletableEntity {
    @Column({ unique: true })
    contactZoneName!: string;

    @OneToMany(() => SwabArea, entity => entity.contactZone)
    swabAreas: SwabArea[];
}