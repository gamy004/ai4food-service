import { IsUUID, Validate } from 'class-validator';
import { CleaningRoomHistoryExistsRule } from '../validators/cleaning-room-history-exists-validator';

export class ConnectCleaningRoomHistoryDto {
  @IsUUID()
  @Validate(CleaningRoomHistoryExistsRule)
  id: string;
}
