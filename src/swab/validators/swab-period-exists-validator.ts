import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { SwabPeriod } from '../entities/swab-period.entity';

@ValidatorConstraint({ name: 'SwabPeriodExists', async: true })
@Injectable()
export class SwabPeriodExistsRule extends EntityExistsRule<SwabPeriod> {
  constructor(
    @InjectRepository(SwabPeriod)
    repository: CommonRepositoryInterface<SwabPeriod>,
  ) {
    super(repository);
  }
}
