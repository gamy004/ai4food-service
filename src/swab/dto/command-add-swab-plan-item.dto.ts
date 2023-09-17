import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ConnectSwabAreaDto } from './connect-swab-area.dto';
import { ConnectFacilityItemDto } from '~/facility/dto/connect-facility-item.dto';
import { ConnectSwabPlanDto } from './connect-swab-plan.dto';

export class PayloadAddSwabPlanItemDto {
  @ValidateNested()
  @Type(() => ConnectSwabPlanDto)
  swabPlan!: ConnectSwabPlanDto;

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
