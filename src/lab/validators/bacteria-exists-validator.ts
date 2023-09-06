import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { Bacteria } from '../entities/bacteria.entity';

@ValidatorConstraint({ name: 'BacteriaExists', async: true })
@Injectable()
export class BacteriaExistsRule extends EntityExistsRule<Bacteria> {
  constructor(
    @InjectRepository(Bacteria)
    repository: CommonRepositoryInterface<Bacteria>,
  ) {
    super(repository);
  }
}
