import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class FindAllSwabAreaQueryDto {
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    subSwabAreas?: boolean;
}

