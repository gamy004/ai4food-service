import { IsUUID, Validate } from 'class-validator';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class ConnectSwabPlanDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  id: string;
}
