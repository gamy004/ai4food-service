import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { SwabPlanItem } from '../entities/swab-plan-item.entity';

@ValidatorConstraint({ name: 'SwabPlanItemExists', async: true })
@Injectable()
export class SwabPlanItemExistsRule extends EntityExistsRule<SwabPlanItem> {
  constructor(
    @InjectRepository(SwabPlanItem)
    repository: CommonRepositoryInterface<SwabPlanItem>,
  ) {
    super(repository);
  }
}
