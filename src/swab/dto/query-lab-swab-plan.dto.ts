import { PickType } from '@nestjs/swagger';
import { FilterSwabAreaHistoryDto } from './filter-swab-area-history.dto';

export class QueryLabSwabPlanDto extends PickType(FilterSwabAreaHistoryDto, [
  'swabAreaDate',
  'shift',
  'swabTestCode',
  'swabPeriodId',
  'facilityId',
  'facilityItemId',
  'swabAreaId',
]) {}
