import { IsUUID, Validate } from 'class-validator';
import { CleaningHistoryExistsRule } from '../validators/cleaning-history-exists-validator';

export class ConnectCleaningHistoryDto {
  @IsUUID()
  @Validate(CleaningHistoryExistsRule)
  id: string;
}
