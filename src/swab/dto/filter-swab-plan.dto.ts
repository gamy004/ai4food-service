import { IsOptional, IsEnum, IsUUID, Validate } from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { MonthOnlyRule } from '~/common/validators/month-only-validator';
import { YearOnlyRule } from '~/common/validators/year-only-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';
import { DayOnlyRule } from '~/common/validators/day-only-validator';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class FilterSwabPlanDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  id?: string;

  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;

  @IsOptional()
  @IsUUID()
  @Validate(SwabPeriodExistsRule)
  swabPeriodId?: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaExistsRule)
  swabAreaId?: string;

  @IsOptional()
  @IsUUID()
  @Validate(FacilityItemExistsRule)
  facilityItemId?: string;

  @IsOptional()
  @Validate(DayOnlyRule)
  day?: string;

  @IsOptional()
  @Validate(MonthOnlyRule)
  month?: string;

  @IsOptional()
  @Validate(YearOnlyRule)
  year?: string;
}
