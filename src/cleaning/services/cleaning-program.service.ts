import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CleaningProgram } from '../entities/cleaning-program.entity';

@Injectable()
export class CleaningProgramService extends CrudService<CleaningProgram> {
  constructor(
    @InjectRepository(CleaningProgram)
    repository: CommonRepositoryInterface<CleaningProgram>,
  ) {
    super(repository);
  }
}
