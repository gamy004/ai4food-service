import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';

class orderDto {
  @IsNotEmpty()
  value: string;

  @IsNotEmpty()
  order: number;
}

export class TemplateSwabPlanDto {
  @IsOptional()
  DAY: object;

  @IsOptional()
  NIGHT: object;

  @IsOptional()
  order: Array<orderDto>;
}

export class TemplateCreateSwabPlanDto {
  @Validate(DateOnlyRule)
  @IsNotEmpty()
  fromDate: string;

  @Validate(DateOnlyRule)
  @IsNotEmpty()
  toDate: string;

  @IsNotEmpty()
  template: TemplateSwabPlanDto;
}

export class CreateSwabPlanDto {
  @IsOptional()
  id: number;

  @IsNotEmpty()
  swabRoundName: string;

  @IsNotEmpty()
  templateCreateSwabPlans: TemplateCreateSwabPlanDto[];
}
