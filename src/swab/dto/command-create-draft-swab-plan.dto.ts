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
import { Unique, IsNull } from 'typeorm';
import { SwabPlan } from '../entities/swab-plan.entity';

export class BodyCommandCreateDraftSwabPlanDto {
  @IsNotEmpty()
  @Validate(DateOnlyRule)
  @Validate(Unique, [
    SwabPlan,
    ({
      object: { swabPlanDate, swabPeriod, shift },
    }: {
      object: Partial<SwabPlan>;
    }) => {
      console.log('check unique swab plan:', {
        swabPlanDate,
        shift,
        swabPeriodId: swabPeriod.id,
        deletedAt: IsNull(),
      });

      return {
        swabPlanDate,
        swabPeriodId: swabPeriod.id,
        deletedAt: IsNull(),
      };
    },
  ])
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
