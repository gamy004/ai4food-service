import { IsUUID, Validate } from 'class-validator';
import { RoomExistsRule } from '../validators/room-exists-validator';

export class ConnectRoomDto {
  @IsUUID()
  @Validate(RoomExistsRule)
  id!: string;
}
