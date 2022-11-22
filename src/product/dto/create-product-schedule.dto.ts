import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { TimeGreaterThanRule } from '~/common/validators/time-greater-than-validator';
import { TimeOnlyRule } from '~/common/validators/time-only-validator';
import { Unique } from '~/common/validators/unique-validator';
import { ConnectProductDto } from '~/product/dto/connect-product.dto';
import { ProductSchedule } from '../entities/product-schedule.entity';

export class CreateProductScheduleDto extends ContextAwareDto {
  @IsInt()
  @Min(1)
  productScheduleAmount: number;

  @Validate(DateOnlyRule)
  productScheduleDate: string;

  @Validate(TimeOnlyRule)
  productScheduleStartedAt: string;

  @Validate(TimeOnlyRule)
  @Validate(TimeGreaterThanRule, ['productScheduleStartedAt'])
  productScheduleEndedAt: string;

  @ValidateNested()
  @Type(() => ConnectProductDto)
  @Validate(
    Unique,
    [
      ProductSchedule,
      ({
        object: {
          product,
          productScheduleDate,
          productScheduleStartedAt,
          productScheduleEndedAt,
          context,
        },
      }: {
        object: Partial<ProductSchedule> & ContextAwareDto;
      }) => {
        const whereCondition: FindOptionsWhere<ProductSchedule> = {
          productId: product.id,
          productScheduleDate: new Date(productScheduleDate),
          productScheduleStartedAt,
          productScheduleEndedAt,
          deletedAt: IsNull(),
        };

        if (context && context.params && context.params.id) {
          whereCondition.id = Not(context.params.id);
        }

        return whereCondition;
      },
    ],
    {
      message:
        "ProductSchedule with the following fields already exists: ['product', 'productScheduleDate', 'productScheduleStartedAt', 'productScheduleEndedAt']",
    },
  )
  product: ConnectProductDto;

  @IsNotEmpty()
  shift: Shift;
}
