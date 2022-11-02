import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Validate,
} from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';

export class QueryUpdateSwabPlanV2Dto {
  @Validate(DateOnlyRule)
  swabAreaDate: string;

  @IsOptional()
  @IsEnum(Shift)
  shift: Shift;

  @IsOptional()
  @IsUUID()
  @Validate(FacilityExistsRule)
  facilityId: string;

  @IsOptional()
  @IsUUID()
  @Validate(FacilityItemExistsRule)
  facilityItemId: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaExistsRule)
  mainSwabAreaId: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabPeriodExistsRule)
  swabPeriodId: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take: number;
}
