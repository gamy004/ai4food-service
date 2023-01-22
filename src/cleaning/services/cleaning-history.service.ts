import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CleaningHistory } from '../entities/cleaning-history.entity';

@Injectable()
export class CleaningHistoryService extends CrudService<CleaningHistory> {
  constructor(
    @InjectRepository(CleaningHistory)
    repository: CommonRepositoryInterface<CleaningHistory>,
  ) {
    super(repository);
  }
}
