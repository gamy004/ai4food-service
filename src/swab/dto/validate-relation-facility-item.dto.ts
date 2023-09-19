import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ConnectFacilityItemDto } from '~/facility/dto/connect-facility-item.dto';
import { ConnectSwabAreaDto } from './connect-swab-area.dto';

export class BodyValidateRelationFacilityItemDto {
  @ValidateNested()
  @Type(() => ConnectSwabAreaDto)
  swabArea!: ConnectSwabAreaDto;

  @ValidateNested()
  @Type(() => ConnectFacilityItemDto)
  facilityItem!: ConnectFacilityItemDto;
}
