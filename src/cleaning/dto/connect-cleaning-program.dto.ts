import { IsUUID, Validate } from 'class-validator';
import { CleaningProgramExistsRule } from '../validators/cleaning-program-exists-validator';

export class ConnectCleaninProgramDto {
  @IsUUID()
  @Validate(CleaningProgramExistsRule)
  id: string;
}
