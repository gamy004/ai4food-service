import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ConnectUserDto } from '~/auth/dto/connect-user.dto';
import { ConnectFileDto } from '~/common/dto/connect-file.dto';
// import { User } from "~/auth/entities/user.entity";
import {
  ImportSource,
  ImportType,
} from '../entities/import-transaction.entity';

export class CreateImportTransactionDto {
  @IsEnum(ImportType)
  importType: ImportType;

  @IsEnum(ImportSource)
  importSource: ImportSource;

  @IsOptional()
  @IsNotEmpty()
  importedFileUrl?: string;

  @IsOptional()
  @IsNotEmpty()
  importedFileName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectFileDto)
  importedFile?: ConnectFileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectUserDto)
  importedUser?: ConnectUserDto;
}
