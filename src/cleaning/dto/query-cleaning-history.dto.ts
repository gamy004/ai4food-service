import { PickType } from '@nestjs/swagger';
import { FilterCleaningHistoryDto } from './filter-cleaning-history.dto';

export class QueryCleaningHistoryDto extends PickType(
  FilterCleaningHistoryDto,
  [
    'date',
    'fromDate',
    'toDate',
    'shift',
    'swabTestCode',
    'swabPeriodId',
    'swabAreaId',
    'skip',
    'take',
  ],
) {}
