import {
  IsNotEmpty,
  Validate,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';
import { SwabProductHistoryExistsRule } from '../validators/swab-product-history-exists-validator';
import { ProductExistsRule } from '~/product/validators/product-exists-validator';
import { Shift } from '~/common/enums/shift';

export class FilterSwabProductHistoryDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabProductHistoryExistsRule)
  id?: string;

  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;

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

  @IsOptional()
  @IsUUID()
  @Validate(ProductExistsRule)
  productId?: string;

  @IsOptional()
  @IsNotEmpty()
  bacteriaName?: string;
}
