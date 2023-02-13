import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { CleaningValidation } from '../entities/cleaning-validation.entity';

@ValidatorConstraint({ name: 'cleaningValidationExists', async: true })
@Injectable()
export class CleaningValidationExistsRule extends EntityExistsRule<CleaningValidation> {
  constructor(
    @InjectRepository(CleaningValidation)
    repository: CommonRepositoryInterface<CleaningValidation>,
  ) {
    super(repository);
  }
}
