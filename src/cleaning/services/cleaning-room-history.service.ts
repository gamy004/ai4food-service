import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CleaningRoomHistory } from '../entities/cleaning-room-history.entity';
import { DateTransformer } from '~/common/transformers/date-transformer';

@Injectable()
export class CleaningRoomHistoryService extends CrudService<CleaningRoomHistory> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(CleaningRoomHistory)
    repository: CommonRepositoryInterface<CleaningRoomHistory>,
  ) {
    super(repository);
  }

  computeTimestamp(
    entity: CleaningRoomHistory,
    timezone: string | null = null,
  ): CleaningRoomHistory {
    entity.cleaningRoomStartedAtTimestamp = this.dateTransformer.toTimestamp(
      entity.cleaningRoomDate,
      entity.cleaningRoomStartedAt,
      timezone,
    );

    entity.cleaningRoomEndedAtTimestamp = this.dateTransformer.toTimestamp(
      entity.cleaningRoomDate,
      entity.cleaningRoomEndedAt,
      timezone,
    );

    return entity;
  }
}
