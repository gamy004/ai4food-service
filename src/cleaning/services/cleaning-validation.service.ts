import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CleaningValidation } from '../entities/cleaning-validation.entity';

@Injectable()
export class CleaningValidationService extends CrudService<CleaningValidation> {
  constructor(
    @InjectRepository(CleaningValidation)
    repository: CommonRepositoryInterface<CleaningValidation>,
  ) {
    super(repository);
  }
}
