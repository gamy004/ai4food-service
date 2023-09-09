import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { SwabPlan } from '../entities/swab-plan.entity';

@ValidatorConstraint({ name: 'SwabPlanExists', async: true })
@Injectable()
export class SwabPlanExistsRule extends EntityExistsRule<SwabPlan> {
  constructor(
    @InjectRepository(SwabPlan)
    repository: CommonRepositoryInterface<SwabPlan>,
  ) {
    super(repository);
  }
}
