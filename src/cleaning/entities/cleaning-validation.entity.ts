import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { CleaningHistoryCleaningValidation } from './cleaning-history-cleaning-validation.entity';

@Entity()
export class CleaningValidation extends BaseSoftDeletableEntity {
  @Column()
  cleaningValidationName: string;

  @Column({ type: 'text', nullable: true })
  cleaningValidationDescription: string;

  @Column({ default: false })
  active: boolean;

  @OneToMany(
    () => CleaningHistoryCleaningValidation,
    (entity) => entity.cleaningValidation,
    {
      cascade: ['insert', 'update', 'soft-remove'],
    },
  )
  cleaningHistoryValidations: CleaningHistoryCleaningValidation[];
}
