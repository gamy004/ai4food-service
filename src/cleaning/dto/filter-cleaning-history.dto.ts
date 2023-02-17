import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  Validate,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabAreaExistsRule } from '~/swab/validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from '~/swab/validators/swab-period-exists-validator';
import { CleaningHistoryExistsRule } from '../validators/cleaning-history-exists-validator';

export class FilterCleaningHistoryDto {
  @IsOptional()
  @IsUUID()
  @Validate(CleaningHistoryExistsRule)
  id?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  date?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  fromDate?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  toDate?: string;

  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;

  @IsOptional()
  @IsNotEmpty()
  swabTestCode?: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabPeriodExistsRule)
  swabPeriodId?: string;

  @IsOptional()
  @IsUUID()
  @Validate(FacilityExistsRule)
  facilityId?: string;

  @IsOptional()
  @IsUUID()
  @Validate(FacilityItemExistsRule)
  facilityItemId?: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaExistsRule)
  swabAreaId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;
}
