import { IsOptional, IsUUID, Validate } from 'class-validator';
import { BacteriaExistsRule } from '../validators/bacteria-exists-validator';

export class FindAllBacteriaSpecieQuery {
  @Validate(BacteriaExistsRule)
  @IsOptional()
  @IsUUID()
  bacteriaId?: string;
}
