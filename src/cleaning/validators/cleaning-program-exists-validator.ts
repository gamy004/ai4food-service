import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { CleaningProgram } from '../entities/cleaning-program.entity';

@ValidatorConstraint({ name: 'cleaningProgramExists', async: true })
@Injectable()
export class CleaningProgramExistsRule extends EntityExistsRule<CleaningProgram> {
  constructor(
    @InjectRepository(CleaningProgram)
    repository: CommonRepositoryInterface<CleaningProgram>,
  ) {
    super(repository);
  }
}
