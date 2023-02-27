import { IsBoolean, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';

export class GenerateSwabPlanDto {
  @Validate(DateOnlyRule)
  fromDate: string;

  @Validate(DateOnlyRule)
  toDate: string;

  @IsNotEmpty()
  roundNumberSwabTest: string;

  @IsOptional()
  @IsBoolean()
  skipBigCleaning?: boolean;

  @IsOptional()
  @IsBoolean()
  includeDayShiftFirstDay?: boolean;

  @IsOptional()
  @IsBoolean()
  includeNightShiftFirstDay?: boolean;

  @IsOptional()
  @IsBoolean()
  includeNightShiftLastDay?: boolean;

  @IsOptional()
  @IsBoolean()
  includeGeneralBeforeBigCleaning?: boolean;
}
