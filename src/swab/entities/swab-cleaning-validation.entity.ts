import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity as TypeOrmBaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { CleaningValidation } from '~/cleaning/entities/cleaning-validation.entity';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

@Entity()
export class SwabCleaningValidation extends TypeOrmBaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  cleaningValidationId!: string;

  @ManyToOne(
    () => CleaningValidation,
    (entity) => entity.swabCleaningValidations,
  )
  cleaningValidation!: CleaningValidation;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  swabPeriodId!: string;

  @ManyToOne(() => SwabPeriod, (entity) => entity.swabCleaningValidations)
  swabPeriod!: SwabPeriod;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  swabAreaId!: string;

  @ManyToOne(() => SwabArea, (entity) => entity.swabCleaningValidations)
  swabArea!: SwabArea;
}
