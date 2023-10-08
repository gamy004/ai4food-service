import { Type } from 'class-transformer';
import { Validate, ValidateNested, IsUUID } from 'class-validator';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';
import { SwabPlan } from '../entities/swab-plan.entity';
import { Unique } from '~/common/validators/unique-validator';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { PartialType } from '@nestjs/swagger';
import { PayloadCreateDraftSwabPlanDto } from './command-create-draft-swab-plan.dto';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';
import { SwabPlanSwabPeriodExistsRule } from '../validators/swab-plan-swab-period-exists-validator';

export class ParamCommandUpdateSwabPlanDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  id: string;
}

export class PayloadUpdateSwabPlanDto extends PartialType(
  PayloadCreateDraftSwabPlanDto,
) {}

export class BodyCommandUpdateSwabPlanDto extends ContextAwareDto {
  @ValidateNested()
  @Type(() => PayloadUpdateSwabPlanDto)
  @Validate(Unique, [
    SwabPlan,
    ({ object: { payload, context } }: { object: any & ContextAwareDto }) => {
      const constraints: FindOptionsWhere<SwabPlan> = {
        swabPlanDate: payload.swabPlanDate,
        shift: payload.shift,
        swabPeriodId: payload.swabPeriod.id,
        deletedAt: IsNull(),
      };

      if (context && context.params && context.params.id) {
        constraints.id = Not(context.params.id);
      }

      return constraints;
    },
  ])
  @Validate(SwabPlanSwabPeriodExistsRule, [
    ['ก่อน Super Big Cleaning', 'หลัง Super Big Cleaning'],
    ({ object: { payload, context } }: { object: any & ContextAwareDto }) => {
      const constraints: FindOptionsWhere<SwabPlan> = {
        swabPlanDate: payload.swabPlanDate,
        swabPeriodId: payload.swabPeriod.id,
      };

      if (context && context.params && context.params.id) {
        constraints.id = Not(context.params.id);
      }

      return constraints;
    },
  ])
  payload!: PayloadUpdateSwabPlanDto;
}
