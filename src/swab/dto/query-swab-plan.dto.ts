import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { FilterSwabAreaHistoryDto } from './filter-swab-area-history.dto';

export class QuerySwabPlanDto extends PickType(FilterSwabAreaHistoryDto, [
  'id',
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
  'swabStatus',
  'skip',
  'take',
]) {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  bacteriaSpecies?: boolean;
}
