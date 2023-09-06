import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { BacteriaSpecie } from '../entities/bacteria-specie.entity';

@ValidatorConstraint({ name: 'BacteriaSpecieExists', async: true })
@Injectable()
export class BacteriaSpecieExistsRule extends EntityExistsRule<BacteriaSpecie> {
  constructor(
    @InjectRepository(BacteriaSpecie)
    repository: CommonRepositoryInterface<BacteriaSpecie>,
  ) {
    super(repository);
  }
}
