import { Validate, IsUUID } from 'class-validator';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class ParamCommandDeleteSwabPlanDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  id: string;
}
