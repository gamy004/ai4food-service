import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';
import { BacteriaExistsRule } from '../validators/bacteria-exists-validator';

export const relations = ['bacteriaSpecies'];

export class BacteriaRelation {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  bacteriaSpecies?: boolean;
}

export class FindAllBacteriaQuery {
  @Validate(BacteriaExistsRule)
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsNotEmpty()
  bacteriaName?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BacteriaRelation)
  include?: BacteriaRelation;
}
