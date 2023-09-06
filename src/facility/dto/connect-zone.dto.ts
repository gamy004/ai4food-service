import { IsUUID, Validate } from 'class-validator';
import { ZoneExistsRule } from '../validators/zone-exists-validator';

export class ConnectZoneDto {
  @IsUUID()
  @Validate(ZoneExistsRule)
  id!: string;
}
