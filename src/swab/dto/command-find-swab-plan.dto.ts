import { PickType } from '@nestjs/swagger';
import { FilterSwabPlanDto } from './filter-swab-plan.dto';

export class PayloadCommandFindSwabPlanDto extends PickType(FilterSwabPlanDto, [
  'id',
  'shift',
  'swabPeriodId',
  'month',
  'year',
]) {}
