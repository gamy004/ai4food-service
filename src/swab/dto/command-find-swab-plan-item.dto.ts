import { IsUUID, Validate } from 'class-validator';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class ParamCommandFindSwabPlanItemDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  swabPlanId: string;
}
