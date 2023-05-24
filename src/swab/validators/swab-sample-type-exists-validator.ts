import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { SwabSampleType } from '../entities/swab-sample-type.entity';

@ValidatorConstraint({ name: 'SwabSampleTypeExists', async: true })
@Injectable()
export class SwabSampleTypeExistsRule extends EntityExistsRule<SwabSampleType> {
  constructor(
    @InjectRepository(SwabSampleType)
    repository: CommonRepositoryInterface<SwabSampleType>,
  ) {
    super(repository);
  }
}
