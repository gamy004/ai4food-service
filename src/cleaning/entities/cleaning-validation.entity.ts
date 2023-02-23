import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
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

  @Column({ type: 'varchar', length: 36 })
  swabPeriodId!: string;

  @ManyToOne(() => SwabPeriod, (entity) => entity.cleaningValidations)
  swabPeriod: SwabPeriod;

  @OneToMany(
    () => CleaningHistoryCleaningValidation,
    (entity) => entity.cleaningValidation,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  cleaningHistoryValidations: CleaningHistoryCleaningValidation[];
}
