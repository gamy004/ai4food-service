import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Validate,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabStatus } from '../entities/swab-test.entity';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';
import { SwabSampleTypeExistsRule } from '../validators/swab-sample-type-exists-validator';

export class FilterHistoryDto {
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

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isReported?: boolean;

  @IsOptional()
  @IsUUID()
  @Validate(SwabSampleTypeExistsRule)
  swabSampleTypeId?: string;
}
