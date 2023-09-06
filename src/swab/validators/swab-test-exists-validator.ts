import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { SwabTest } from '../entities/swab-test.entity';

@ValidatorConstraint({ name: 'SwabTestExists', async: true })
@Injectable()
export class SwabTestExistsRule extends EntityExistsRule<SwabTest> {
  constructor(
    @InjectRepository(SwabTest)
    repository: CommonRepositoryInterface<SwabTest>,
  ) {
    super(repository);
  }
}
