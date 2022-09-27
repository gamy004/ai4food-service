import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsObject
} from 'class-validator';

export const relations = ['subSwabAreas'];

export class SwabAreaQueryRelation {
  @IsBoolean()
  @Type(() => Boolean)
  subSwabAreas?: boolean;
}

export class FindAllSwabAreaQuery {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SwabAreaQueryRelation)
  include?: SwabAreaQueryRelation;
}
