import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ConnectFileDto } from '~/common/dto/connect-file.dto';
import { ImportStatus } from '../entities/import-transaction.entity';
import { CreateImportTransactionDto } from './create-import-transaction.dto';

export class UpdateImportTransactionDto extends PartialType(
  CreateImportTransactionDto,
) {
  @IsEnum(ImportStatus)
  importStatus: ImportStatus;

  @IsOptional()
  @IsNotEmpty()
  importedFileName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectFileDto)
  importedFile?: ConnectFileDto;
}
