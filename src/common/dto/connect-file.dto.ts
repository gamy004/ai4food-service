import { IsUUID, Validate } from 'class-validator';
import { FileExistsRule } from '../validators/file-exists-validator';

export class ConnectFileDto {
  @IsUUID()
  @Validate(FileExistsRule)
  id: string;
}
