import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { CleaningHistory } from './cleaning-history.entity';
import { CleaningValidation } from './cleaning-validation.entity';

@Entity()
export class CleaningHistoryCleaningValidation extends BaseSoftDeletableEntity {
  @Column({ type: 'varchar', length: 36 })
  public cleaningHistoryId!: string;

  @ManyToOne(
    () => CleaningHistory,
    (cleaningHistory) => cleaningHistory.cleaningHistoryValidations,
  )
  public cleaningHistory!: CleaningHistory;

  @Column({ type: 'varchar', length: 36 })
  public cleaningValidationId!: string;

  @ManyToOne(
    () => CleaningValidation,
    (category) => category.cleaningHistoryValidations,
  )
  public cleaningValidation!: CleaningValidation;

  @Column({ default: false })
  public pass!: boolean;
}
