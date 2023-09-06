import { IsUUID, Validate } from 'class-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';

export class ConnectSwabAreaDto {
  @IsUUID()
  @Validate(SwabAreaExistsRule)
  id: string;
}
