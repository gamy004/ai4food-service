import { IsUUID, Validate, ValidateIf } from 'class-validator';
import { FacilityItemExistsRule } from '../validators/facility-item-exists-validator';

export class ConnectFacilityItemDto {
  @IsUUID()
  @ValidateIf((o) => o.id !== null)
  @Validate(FacilityItemExistsRule)
  id!: string | null;
}
