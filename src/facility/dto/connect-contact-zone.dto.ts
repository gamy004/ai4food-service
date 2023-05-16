import { IsUUID, Validate } from 'class-validator';
import { ContactZoneExistsRule } from '../validators/contact-zone-exists-validator';

export class ConnectContactZoneDto {
  @IsUUID()
  @Validate(ContactZoneExistsRule)
  id!: string;
}
