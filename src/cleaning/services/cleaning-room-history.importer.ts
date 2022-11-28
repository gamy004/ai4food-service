import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporter } from '~/data-collector/data-collector.importer';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { CleaningRoomHistory } from '../entities/cleaning-room-history.entity';
import { CleaningRoomHistoryService } from './cleaning-room-history.service';

export class CleaningRoomHistoryImporter extends DataCollectorImporter<CleaningRoomHistory> {
  importType: ImportType = ImportType.PRODUCT_SCHEDULE;

  mappingKeys: string[] = [
    'roomId',
    'cleaningRoomDate',
    'cleaningRoomStartedAt',
    'cleaningRoomEndedAt',
  ];

  constructor(
    private readonly cleaningRoomHistoryService: CleaningRoomHistoryService,
    transaction: TransactionDatasource,
    @InjectRepository(CleaningRoomHistory)
    repository: CommonRepositoryInterface<CleaningRoomHistory>,
  ) {
    super(transaction, repository);
  }

  map(record: CleaningRoomHistory) {
    const {
      cleaningRoomDate,
      cleaningRoomStartedAt,
      cleaningRoomEndedAt,
      room,
    } = record;

    const { id: roomId } = room;

    return {
      roomId,
      cleaningRoomDate,
      cleaningRoomStartedAt,
      cleaningRoomEndedAt,
    };
  }

  preProcess(records: CleaningRoomHistory[]) {
    const timezone = this.getTimezone();

    return records.map((record) => {
      record = this.cleaningRoomHistoryService.computeTimestamp(
        record,
        timezone,
      );

      return record;
    });
  }
}
