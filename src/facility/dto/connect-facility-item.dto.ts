import { IsUUID, Validate } from 'class-validator';
import { FacilityItemExistsRule } from '../validators/facility-item-exists-validator';

export class ConnectFacilityItemDto {
  @IsUUID()
  @Validate(FacilityItemExistsRule)
  id!: string;
}
