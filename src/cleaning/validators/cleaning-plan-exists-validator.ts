import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { CleaningPlan } from '../entities/cleaning-plan.entity';

@ValidatorConstraint({ name: 'cleaningPlanExists', async: true })
@Injectable()
export class CleaningPlanExistsRule extends EntityExistsRule<CleaningPlan> {
  constructor(
    @InjectRepository(CleaningPlan)
    repository: CommonRepositoryInterface<CleaningPlan>,
  ) {
    super(repository);
  }
}
