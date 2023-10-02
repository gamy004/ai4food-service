import { Type } from 'class-transformer';
import { IsOptional, IsUUID, Validate, ValidateNested } from 'class-validator';
import { ConnectSwabAreaDto } from './connect-swab-area.dto';
import { ConnectFacilityItemDto } from '~/facility/dto/connect-facility-item.dto';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class ParamCommandAddSwabPlanItemDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  swabPlanId: string;
}

export class PayloadAddSwabPlanItemDto {
  @ValidateNested()
  @Type(() => ConnectSwabAreaDto)
  swabArea!: ConnectSwabAreaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectFacilityItemDto)
  facilityItem?: ConnectFacilityItemDto;
}

export class BodyCommandAddSwabPlanItemDto {
  @ValidateNested()
  @Type(() => PayloadAddSwabPlanItemDto)
  payload!: PayloadAddSwabPlanItemDto;
}
