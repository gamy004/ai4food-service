import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabCleaningValidation } from '~/swab/entities/swab-cleaning-validation.entity';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';
import { CleaningHistoryCleaningValidation } from './cleaning-history-cleaning-validation.entity';

@Entity()
export class CleaningValidation extends BaseSoftDeletableEntity {
  @Column()
  cleaningValidationName: string;

  @Column({ type: 'text', nullable: true })
  cleaningValidationDescription: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(
    () => CleaningHistoryCleaningValidation,
    (entity) => entity.cleaningValidation,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  cleaningHistoryValidations: CleaningHistoryCleaningValidation[];

  @ManyToMany(() => SwabPeriod, (entity) => entity.cleaningValidations)
  swabPeriods: SwabPeriod[];

  @OneToMany(
    () => SwabCleaningValidation,
    (entity) => entity.cleaningValidation,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  swabCleaningValidations: SwabCleaningValidation[];
}
