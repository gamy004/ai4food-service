import { Validate, IsUUID } from 'class-validator';
import { SwabPlanItemExistsRule } from '../validators/swab-plan-item-exists-validator';

export class ParamCommandDeleteSwabPlanItemDto {
  @IsUUID()
  @Validate(SwabPlanItemExistsRule)
  id: string;
}
