import {
  IsNotEmpty,
  Validate,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { SwabTestExistsRule } from '../validators/swab-test-exists-validator';
import { FacilityExistsRule } from '~/facility/validators/facility-exists-validator';
import { FacilityItemExistsRule } from '~/facility/validators/facility-item-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';
import { SwabProductHistoryExistsRule } from '../validators/swab-product-history-exists-validator';
import { ProductExistsRule } from '~/product/validators/product-exists-validator';
import { Shift } from '~/common/enums/shift';
import { Transform, Type } from 'class-transformer';
import { SwabStatus } from '../entities/swab-test.entity';
import { FilterHistoryDto } from './filter-history.dto';

export class FilterSwabProductHistoryDto extends FilterHistoryDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabProductHistoryExistsRule)
  id?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  swabProductDate?: string;

  @IsOptional()
  @IsUUID()
  @Validate(ProductExistsRule)
  productId?: string;
}
