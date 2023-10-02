import { Validate, IsUUID } from 'class-validator';
import { SwabPlanItemExistsRule } from '../validators/swab-plan-item-exists-validator';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class ParamCommandDeleteSwabPlanItemDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  swabPlanId: string;

  @IsUUID()
  @Validate(SwabPlanItemExistsRule)
  swabPlanItemId: string;
}
