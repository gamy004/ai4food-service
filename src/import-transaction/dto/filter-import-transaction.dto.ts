import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  Validate,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import {
  ImportSource,
  ImportType,
} from '../entities/import-transaction.entity';
import { ImportTransactionExistsRule } from '../validators/import-transaction-exists-validator';

export class FilterImportTransactionDto {
  @IsOptional()
  @IsUUID()
  @Validate(ImportTransactionExistsRule)
  id?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  fromDate?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  toDate?: string;

  @IsOptional()
  @IsEnum(ImportType)
  importType?: ImportType;

  @IsOptional()
  @IsEnum(ImportSource)
  importSource?: ImportSource;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;
}
