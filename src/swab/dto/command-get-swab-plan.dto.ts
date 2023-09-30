import { PickType } from '@nestjs/swagger';
import { FilterSwabPlanDto } from './filter-swab-plan.dto';

export class PayloadCommandGetSwabPlanDto extends PickType(FilterSwabPlanDto, [
  'shift',
  'swabPeriodId',
  'month',
  'year',
]) {}
