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
import { IsNull } from 'typeorm';
import { SwabPlan } from '../entities/swab-plan.entity';
import { Unique } from '~/common/validators/unique-validator';

export class PayloadCreateDraftSwabPlanDto {
  @IsNotEmpty()
  @Validate(DateOnlyRule)
  swabPlanDate!: string;

  @IsNotEmpty()
  shift!: Shift;

  @ValidateNested()
  @Type(() => ConnectSwabPeriodDto)
  swabPeriod!: ConnectSwabPeriodDto;

  @IsOptional()
  swabPlanNote?: string;

  @IsOptional()
  @Length(1, 10)
  swabPlanCode?: string;
}

export class BodyCommandCreateDraftSwabPlanDto {
  @ValidateNested()
  @Type(() => PayloadCreateDraftSwabPlanDto)
  @Validate(Unique, [
    SwabPlan,
    ({ object: { payload } }: { object: any }) => ({
      swabPlanDate: payload.swabPlanDate,
      shift: payload.shift,
      swabPeriodId: payload.swabPeriod.id,
      deletedAt: IsNull(),
    }),
  ])
  payload!: PayloadCreateDraftSwabPlanDto;
}
