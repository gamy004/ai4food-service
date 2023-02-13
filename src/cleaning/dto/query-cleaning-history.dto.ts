import { PickType } from '@nestjs/swagger';
import { FilteCleaningHistoryDto } from './filter-cleaning-history.dto';

export class QueryCleaningHistoryDto extends PickType(FilteCleaningHistoryDto, [
  'date',
  'fromDate',
  'toDate',
  'shift',
  'swabPeriodId',
  'swabAreaId',
  'skip',
  'take',
]) {}
