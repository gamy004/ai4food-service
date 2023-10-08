import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, In, IsNull, Raw } from 'typeorm';
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

interface CheckSwabPlanSwabPeriodConstraint {
  swabPlanDate: string;
  swabPeriodId: string;
}

interface SwabPlanSwabPeriodValidationArguments<E> extends ValidationArguments {
  constraints: [
    ValidSwabPeriodName[],
    (
      | ((
          validationArguments: ValidationArguments,
        ) => CheckSwabPlanSwabPeriodConstraint)
      | keyof E
    ),
  ];
}

@ValidatorConstraint({ name: 'SwabPlanSwabPeriodExistsRule', async: true })
@Injectable()
export class SwabPlanSwabPeriodExistsRule
  implements ValidatorConstraintInterface
{
  protected validatedDate: string;
  protected validatedSwabPeriodName: string;

  constructor(protected readonly dataSource: DataSource) {}

  public async validate(
    value: string,
    args: SwabPlanSwabPeriodValidationArguments<SwabPlan>,
  ) {
    let valid = true;
    const [swabPeriodConstraints, findCondition = args.property] =
      args.constraints;

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

    const conditions =
      typeof findCondition === 'function'
        ? findCondition(args)
        : {
            [findCondition || args.property]: value,
          };

    if (targetSwabPeriodIds.includes(conditions.swabPeriodId)) {
      this.validatedDate = conditions.swabPlanDate;
      this.validatedSwabPeriodName = targetSwabPeriods.find(
        ({ id }) => id == conditions.swabPeriodId,
      ).swabPeriodName;

      const queryResult = await swabPlanRepository.count({
        where: {
          swabPlanDate: Raw(
            (field) => `MONTH(${field}) = MONTH('${conditions.swabPlanDate}')`,
          ),
          swabPeriodId: conditions.swabPeriodId,
        },
      });

      valid = queryResult <= 0;
    }

    return valid;
  }

  defaultMessage() {
    return `swab period '${this.validatedSwabPeriodName}' already exists in the same month of ${this.validatedDate}, allow only once per month.`;
  }
}
