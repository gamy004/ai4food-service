import {
  IsNotEmpty,
  IsEnum,
  Validate,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';
import { SwabAreaHistoryExistsRule } from '../validators/swab-area-history-exists-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';
import { Transform, Type } from 'class-transformer';
import { SwabStatus } from '../entities/swab-test.entity';

export class FilterSwabAreaHistoryDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaHistoryExistsRule)
  id?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  swabAreaDate?: string;

  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;

  @IsOptional()
  @IsEnum(SwabStatus)
  swabStatus?: SwabStatus;

  @IsOptional()
  @IsNotEmpty()
  swabTestCode?: string;

  @IsOptional()
  @IsNumber()
  @Validate(SwabTestExistsRule)
  swabTestId?: number;

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
  @IsNotEmpty()
  bacteriaName?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasBacteria?: boolean;

  @IsOptional()
  @Validate(DateOnlyRule)
  fromDate?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  toDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;
}
