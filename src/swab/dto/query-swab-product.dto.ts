import { PickType } from '@nestjs/swagger';
import { FilterSwabProductHistoryDto } from './filter-swab-product-history.dto';

export class QuerySwabProductDto extends PickType(FilterSwabProductHistoryDto, [
  'swabProductDate',
  'shift',
  'swabPeriodId',
  'facilityId',
  'facilityItemId',
  'productId',
  'bacteriaName'
]) { }
