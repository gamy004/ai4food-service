import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { CleaningHistory } from '../entities/cleaning-history.entity';

@ValidatorConstraint({ name: 'cleaningHistoryExists', async: true })
@Injectable()
export class CleaningHistoryExistsRule extends EntityExistsRule<CleaningHistory> {
  constructor(
    @InjectRepository(CleaningHistory)
    repository: CommonRepositoryInterface<CleaningHistory>,
  ) {
    super(repository);
  }
}
