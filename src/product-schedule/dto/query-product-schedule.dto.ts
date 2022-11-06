import { IsOptional, Validate } from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { TimeOnlyRule } from '~/common/validators/time-only-validator';

export class QueryProductScheduleDto {
  @IsOptional()
  @Validate(DateOnlyRule)
  fromDate?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  toDate?: string;

  @IsOptional()
  @Validate(TimeOnlyRule)
  fromTime?: string;

  @IsOptional()
  @Validate(TimeOnlyRule)
  toTime?: string;
}
