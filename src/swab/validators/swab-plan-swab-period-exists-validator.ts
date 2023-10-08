import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, FindOptionsWhere, In, IsNull, Raw } from 'typeorm';
import { SwabPlan } from '../entities/swab-plan.entity';
import { SwabPeriod } from '../entities/swab-period.entity';

export type ValidSwabPeriodName =
  | 'ก่อน Super Big Cleaning'
  | 'หลัง Super Big Cleaning'
  | 'หลังประกอบเครื่อง'
  | 'ก่อนล้างระหว่างงาน'
  | 'หลังล้างระหว่างงาน'
  | 'เดินไลน์หลังพัก 4 ชม.'
  | 'ก่อนล้างท้ายกะ'
  | 'หลังล้างท้ายกะ';

interface SwabPlanSwabPeriodValidationArguments<E> extends ValidationArguments {
  constraints: [
    ValidSwabPeriodName[],
    (validationArguments: ValidationArguments) => FindOptionsWhere<SwabPlan>,
  ];
}

@ValidatorConstraint({ name: 'SwabPlanSwabPeriodExistsRule', async: true })
@Injectable()
export class SwabPlanSwabPeriodExistsRule
  implements ValidatorConstraintInterface
{
  constructor(protected readonly dataSource: DataSource) {}

  public async validate(
    value: string,
    args: SwabPlanSwabPeriodValidationArguments<SwabPlan>,
  ) {
    let valid = true;
    const [swabPeriodConstraints, findCondition] = args.constraints;

    const swabPlanRepository = this.dataSource.getRepository(SwabPlan);
    const swabPeriodRepository = this.dataSource.getRepository(SwabPeriod);

    const targetSwabPeriods = await swabPeriodRepository.find({
      where: {
        swabPeriodName: In(swabPeriodConstraints),
        deletedAt: IsNull(),
      },
      select: {
        id: true,
        swabPeriodName: true,
      },
    });

    const targetSwabPeriodIds = targetSwabPeriods.map(
      (swabPeriod) => swabPeriod.id,
    );

    const conditions = findCondition(args);

    if (targetSwabPeriodIds.includes(conditions.swabPeriodId as string)) {
      const queryResult = await swabPlanRepository.count({
        where: {
          ...conditions,
          swabPlanDate: Raw(
            (field) => `MONTH(${field}) = MONTH('${conditions.swabPlanDate}')`,
          ),
        },
      });

      valid = queryResult <= 0;
    }

    return valid;
  }

  defaultMessage(args: SwabPlanSwabPeriodValidationArguments<SwabPlan>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, findCondition] = args.constraints;

    const conditions = findCondition(args);

    return `swab period '${conditions.swabPeriodId}' already exists in the same month of ${conditions.swabPlanDate}, allow only once per month.`;
  }
}
