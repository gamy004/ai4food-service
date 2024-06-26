import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Raw,
} from 'typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { QueryProductScheduleDto } from '../dto/query-product-schedule.dto';
import { ProductSchedule } from '../entities/product-schedule.entity';

@Injectable()
export class ProductScheduleService extends CrudService<ProductSchedule> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(ProductSchedule)
    repository: CommonRepositoryInterface<ProductSchedule>,
  ) {
    super(repository);
  }

  toFindManyOptions(
    dto: QueryProductScheduleDto,
  ): FindManyOptions<ProductSchedule> {
    const where: FindOptionsWhere<ProductSchedule> = this.toWhere(dto);
    const order: FindOptionsOrder<ProductSchedule> = {
      productScheduleDate: 'asc',
      productScheduleStartedAtTimestamp: 'asc',
      productScheduleEndedAtTimestamp: 'asc',
      product: {
        productName: 'asc',
      },
    };

    return {
      where,
      order,
    };
  }

  toWhere(dto): FindOptionsWhere<ProductSchedule> {
    const where: FindOptionsWhere<ProductSchedule> = {};

    let {
      fromDate: fromDateString,
      toDate: toDateString,
      // fromTime: fromTimeString,
      // toTime: toTimeString,
    } = dto;

    if (toDateString) {
      const toDateObject = this.dateTransformer.toObject(toDateString);

      toDateObject.setDate(toDateObject.getDate() + 1);

      toDateString = this.dateTransformer.toString(toDateObject);
    }

    if (fromDateString && toDateString) {
      where.productScheduleDate = Raw(
        (field) =>
          `${field} >= '${fromDateString}' and ${field} < '${toDateString}'`,
      );
    } else {
      if (fromDateString) {
        where.productScheduleDate = Raw(
          (field) => `${field} >= '${fromDateString}'`,
        );
      }

      if (toDateString) {
        where.productScheduleDate = Raw(
          (field) => `${field} < '${toDateString}'`,
        );
      }
    }

    return where;
  }

  computeTimestamp(entity: ProductSchedule, timezone: string | null = null): ProductSchedule {
    entity.productScheduleStartedAtTimestamp = this.dateTransformer.toShiftTimestamp(
      entity.productScheduleDate,
      entity.productScheduleStartedAt,
      entity.shift,
      timezone
    );

    entity.productScheduleEndedAtTimestamp = this.dateTransformer.toShiftTimestamp(
      entity.productScheduleDate,
      entity.productScheduleEndedAt,
      entity.shift,
      timezone
    );

    return entity;
  }
}
