import { Body, Controller, Inject, Post } from '@nestjs/common';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import { ImportTransactionService } from '~/import-transaction/services/import-transaction.service';
import { ImportCleaningRoomHistoryDto } from '../dto/import-cleaning-room-history.dto';
import { CleaningRoomHistory } from '../entities/cleaning-room-history.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('cleaning-room-history')
@ApiTags('Cleaning')
export class CleaningRoomHistoryController {
  constructor(
    private readonly importTransactionService: ImportTransactionService,
    @Inject('DataCollectorImporterInterface<CleaningRoomHistory>')
    private readonly cleaningRoomHistoryImporter: DataCollectorImporterInterface<CleaningRoomHistory>,
  ) {}

  @Post('import')
  async import(
    @Body() importCleaningRoomHistoryDto: ImportCleaningRoomHistoryDto,
  ): Promise<void> {
    const importTransaction = await this.importTransactionService.findOneBy(
      importCleaningRoomHistoryDto.importTransaction,
    );

    if (importCleaningRoomHistoryDto.timezone) {
      this.cleaningRoomHistoryImporter.setTimezone(
        importCleaningRoomHistoryDto.timezone,
      );
    }

    return this.cleaningRoomHistoryImporter.import(
      importTransaction,
      CleaningRoomHistory.create<CleaningRoomHistory>(
        importCleaningRoomHistoryDto.records,
      ),
    );
  }
}
