import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';

export class GenerateSwabPlanDto {
  @Validate(DateOnlyRule)
  fromDate: string;

  @Validate(DateOnlyRule)
  toDate: string;

  @IsNotEmpty()
  roundNumberSwabTest: string;
}
