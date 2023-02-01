import { PickType } from '@nestjs/swagger';
import { FilterSwabAreaHistoryDto } from './filter-swab-area-history.dto';

export class QueryLabSwabPlanDto extends PickType(FilterSwabAreaHistoryDto, [
  'swabAreaDate',
  'fromDate',
  'toDate',
  'shift',
  'swabTestCode',
  'swabPeriodId',
  'facilityId',
  'facilityItemId',
  'swabAreaId',
  'bacteriaName',
  'hasBacteria',
  'skip',
  'take',
  'swabStatus',
]) {}
