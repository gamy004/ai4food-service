import { Type,Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsObject
} from 'class-validator';

export const relations = ['subSwabAreas'];

export class FindAllSwabAreaQuery {
  @IsOptional()
  @IsBoolean()
  @Transform(({value}) => value === 'true')
  subSwabAreas?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({value}) => value === 'true')
  facility?: boolean;
}
