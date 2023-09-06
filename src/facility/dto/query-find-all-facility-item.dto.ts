import { IsOptional, IsUUID, Validate } from 'class-validator';
import { FacilityExistsRule } from '../validators/facility-exists-validator';

export class QueryFindAllFacilityItemDto {
  @IsOptional()
  @IsUUID()
  @Validate(FacilityExistsRule)
  facilityId?: string;
}
