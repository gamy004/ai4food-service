import { IsUUID, Validate } from 'class-validator';
import { SwabAreaHistoryExistsRule } from '../validators/swab-area-history-exists-validator';

export class QueryUpdateSwabPlanByIdDto {
  @IsUUID()
  @Validate(SwabAreaHistoryExistsRule)
  id: string;
}
