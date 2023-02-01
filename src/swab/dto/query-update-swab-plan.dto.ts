import { IsEnum, IsUUID, Validate } from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';

export class QueryUpdateSwabPlanDto {
  @Validate(DateOnlyRule)
  swabAreaDate: string;

  @IsEnum(Shift)
  shift: Shift;

  @IsUUID()
  @Validate(FacilityExistsRule)
  facilityId: string;

  // @IsUUID()
  // @Validate(FacilityItemExistsRule)
  // facilityItemId: string;

  @IsUUID()
  @Validate(SwabAreaExistsRule)
  swabAreaId: string;

  @IsUUID()
  @Validate(SwabPeriodExistsRule)
  swabPeriodId: string;
}
