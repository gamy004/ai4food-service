import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindAllSwabAreaQuery {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  subSwabAreas?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  facility?: boolean;
}
