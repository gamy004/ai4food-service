import { IsUUID, Validate } from 'class-validator';
import { BacteriaExistsRule } from '../validators/bacteria-exists-validator';

export class ConnectBacteriaDto {
  @IsUUID()
  @Validate(BacteriaExistsRule)
  id!: string;
}
