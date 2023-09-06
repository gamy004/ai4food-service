import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID, Validate } from 'class-validator';
import { FileExistsRule } from '../validators/file-exists-validator';
import { CreateFileDto } from './create-file.dto';

export class UpsertFileDto extends PartialType(CreateFileDto) {
  @IsOptional()
  @IsUUID()
  @Validate(FileExistsRule)
  id?: string;
}
