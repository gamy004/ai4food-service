import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  Validate,
  IsOptional,
  Length,
  ValidateNested,
} from 'class-validator';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { ConnectSwabPeriodDto } from './connect-swab-period.dto';

export class BodyCommandCreateDraftSwabPlanDto {
  @IsNotEmpty()
  @Validate(DateOnlyRule)
  swabPlanDate?: string;

  @IsOptional()
  swabPlanNote?: string;

  @IsOptional()
  @Length(1, 10)
  swabPlanCode?: string;

  @IsOptional()
  @IsNotEmpty()
  shift?: Shift;

  @ValidateNested()
  @Type(() => ConnectSwabPeriodDto)
  swabPeriod?: ConnectSwabPeriodDto;
}
