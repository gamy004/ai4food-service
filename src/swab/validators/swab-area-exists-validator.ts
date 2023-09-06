import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { SwabArea } from '../entities/swab-area.entity';

@ValidatorConstraint({ name: 'SwabAreaExists', async: true })
@Injectable()
export class SwabAreaExistsRule extends EntityExistsRule<SwabArea> {
  constructor(
    @InjectRepository(SwabArea)
    repository: CommonRepositoryInterface<SwabArea>,
  ) {
    super(repository);
  }
}
