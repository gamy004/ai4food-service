import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ConnectFileDto } from '~/common/dto/connect-file.dto';
import { CreateImportTransactionDto } from './create-import-transaction.dto';

export class UpdateImportTransactionDto extends PartialType(
  CreateImportTransactionDto,
) {
  @IsOptional()
  @IsNotEmpty()
  importedFileName?: string;

  @IsOptional()
  @IsNotEmpty()
  importedFileUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectFileDto)
  importedFile?: ConnectFileDto;
}
