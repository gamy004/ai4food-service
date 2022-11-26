import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CleaningRoomHistory } from '../entities/cleaning-room-history.entity';

@Injectable()
export class CleaningRoomHistoryService extends CrudService<CleaningRoomHistory> {
  constructor(
    @InjectRepository(CleaningRoomHistory)
    repository: CommonRepositoryInterface<CleaningRoomHistory>,
  ) {
    super(repository);
  }
}
