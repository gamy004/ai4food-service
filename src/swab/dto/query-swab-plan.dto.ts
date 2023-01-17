import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';

export class QuerySwabPlanDto {
  @IsOptional()
  @Validate(DateOnlyRule)
  fromDate?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  toDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  bacteriaSpecies?: boolean;
}
