import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Validate,
} from 'class-validator';
import { BacteriaExistsRule } from '../validators/bacteria-exists-validator';

export class FindAllBacteriaQuery {
  @Validate(BacteriaExistsRule)
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsNotEmpty()
  bacteriaName?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  bacteriaSpecies?: boolean;
}
