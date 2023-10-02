import { PickType } from '@nestjs/swagger';
import { FilterSwabPlanDto } from './filter-swab-plan.dto';

export class ParamCommandFindOneSwabPlanDto extends PickType(
  FilterSwabPlanDto,
  ['id'],
) {}
