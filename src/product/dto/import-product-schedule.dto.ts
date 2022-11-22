import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { TimeGreaterThanRule } from '~/common/validators/time-greater-than-validator';
import { TimeOnlyRule } from '~/common/validators/time-only-validator';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { ConnectImportTransactionDto } from '~/import-transaction/dto/connect-import-transaction.dto';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { IsImportTypeRule } from '~/import-transaction/validators/is-import-type-validator';
import { ConnectProductDto } from './connect-product.dto';

export class ImportProductScheduleRecordDto extends ContextAwareDto {
  @IsInt()
  @Min(1)
  productScheduleAmount: number;

  @Validate(DateOnlyRule)
  productScheduleDate: string;

  @Validate(TimeOnlyRule)
  productScheduleStartedAt: string;

  @Validate(TimeOnlyRule)
  @Validate(TimeGreaterThanRule, ['productScheduleStartedAt'])
  productScheduleEndedAt: string;

  @ValidateNested()
  @Type(() => ConnectProductDto)
  product: ConnectProductDto;

  @IsNotEmpty()
  shift: Shift;
}

// Object Values!! (Domain Layer)
export class ImportProductScheduleDto {
  @Validate(IsImportTypeRule, [ImportType.PRODUCT_SCHEDULE])
  importTransaction: ConnectImportTransactionDto;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Validate(UniqueFieldRecordRule, [
    'productScheduleDate',
    'productScheduleStartedAt',
    'productScheduleEndedAt',
    'product.id',
  ])
  @Type(() => ImportProductScheduleRecordDto)
  records: ImportProductScheduleRecordDto[];
}
