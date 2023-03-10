import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ContactZone } from '~/facility/entities/contact-zone.entity';
import { BaseSoftDeletableEntity } from '../../common/entities/base-softdeletable.entity';
// import { FacilityItem } from "~/facility/entities/facility-item.entity";
import { Facility } from '../../facility/entities/facility.entity';
import { SwabAreaHistory } from './swab-area-history.entity';
import { SwabCleaningValidation } from './swab-cleaning-validation.entity';

@Entity()
export class SwabArea extends BaseSoftDeletableEntity {
  @Column()
  swabAreaName!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  mainSwabAreaId?: string;

  @ManyToOne(() => SwabArea, (entity) => entity.subSwabAreas, {
    nullable: true,
  })
  mainSwabArea?: SwabArea;

  @OneToMany(() => SwabArea, (entity) => entity.mainSwabArea, { cascade: true })
  subSwabAreas: SwabArea[];

  @OneToMany(() => SwabAreaHistory, (entity) => entity.swabArea, {
    cascade: true,
  })
  swabAreaHistories: SwabAreaHistory[];

  // @Column({ nullable: true })
  // facilityItemId: string;

  // @ManyToOne(() => FacilityItem, entity => entity.swabAreas, { nullable: true })
  // facilityItem?: FacilityItem;

  @Column({ type: 'varchar', length: 36 })
  facilityId!: string;

  @ManyToOne(() => Facility, (entity) => entity.swabAreas)
  facility!: Facility;

  @Column({ type: 'varchar', length: 36, nullable: true })
  contactZoneId: string;

  @ManyToOne(() => ContactZone, (entity) => entity.swabAreas, {
    onDelete: 'SET NULL',
  })
  contactZone: ContactZone;

  @OneToMany(() => SwabCleaningValidation, (entity) => entity.swabArea)
  swabCleaningValidations: SwabCleaningValidation[];
}
