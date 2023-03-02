import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { ConnectImportTransactionDto } from '~/import-transaction/dto/connect-import-transaction.dto';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { IsImportTypeRule } from '~/import-transaction/validators/is-import-type-validator';
import { ConnectBacteriaDto } from '~/lab/dto/connect-bacteria.dto';

export class ImportSwabTestRecordDto extends ContextAwareDto {
  @ValidateNested()
  @Type(() => ConnectBacteriaDto)
  bacteria: ConnectBacteriaDto[];

  @IsNotEmpty()
  swabTestCode: string;
}

export class ImportSwabTestDto {
  @Validate(IsImportTypeRule, [ImportType.SWAB_TEST])
  importTransaction: ConnectImportTransactionDto;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Validate(UniqueFieldRecordRule, ['swabTestCode', 'bacteria'])
  @Type(() => ImportSwabTestRecordDto)
  records: ImportSwabTestRecordDto[];

  @IsOptional()
  timezone?: string;
}
