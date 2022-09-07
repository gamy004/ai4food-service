import {
  IsNotEmpty,
  Validate,
  IsOptional,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';
import { SwabProductHistoryExistsRule } from '../validators/swab-product-history-exists-validator';

export class FilterSwabProductHistoryDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabProductHistoryExistsRule)
  id?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  swabProductDate?: string;

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
}
