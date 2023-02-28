import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { CleaningHistoryCleaningValidation } from '../entities/cleaning-history-cleaning-validation.entity';

@ValidatorConstraint({
  name: 'cleaningHistoryCleaningValidationExists',
  async: true,
})
@Injectable()
export class CleaningHistoryCleaningValidationExistsRule extends EntityExistsRule<CleaningHistoryCleaningValidation> {
  constructor(
    @InjectRepository(CleaningHistoryCleaningValidation)
    repository: CommonRepositoryInterface<CleaningHistoryCleaningValidation>,
  ) {
    super(repository);
  }
}
