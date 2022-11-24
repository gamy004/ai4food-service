import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { zonedTimeToUtc } from 'date-fns-tz';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Raw,
} from 'typeorm';
import { Shift } from '~/common/enums/shift';
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

  computeTimestamp(entity: ProductSchedule, timezone: string): ProductSchedule {
    const timeObjectProductScheduleStartedAt =
      this.dateTransformer.toTimeObject(entity.productScheduleStartedAt);

    let productScheduleDateForStartedAt = this.dateTransformer.toObject(
      entity.productScheduleDate,
      timeObjectProductScheduleStartedAt,
    );

    const timeObjectProductScheduleEndedAt = this.dateTransformer.toTimeObject(
      entity.productScheduleEndedAt,
    );

    let productScheduleDateForEndedAt = this.dateTransformer.toObject(
      entity.productScheduleDate,
      timeObjectProductScheduleEndedAt,
    );

    // for time in shift NIGHT and has started at hour between 00:00 am - 07:00 am, map to next day
    if (
      entity.shift === Shift.NIGHT &&
      timeObjectProductScheduleStartedAt.hours >= 0 &&
      timeObjectProductScheduleStartedAt.hours < 7
    ) {
      productScheduleDateForStartedAt.setDate(
        productScheduleDateForStartedAt.getDate() + 1,
      );
    }

    // for time in shift NIGHT and has ended at hour between 00:00 am - 07:00 am, map to next day
    if (
      entity.shift === Shift.NIGHT &&
      timeObjectProductScheduleEndedAt.hours >= 0 &&
      timeObjectProductScheduleEndedAt.hours < 7
    ) {
      productScheduleDateForEndedAt.setDate(
        productScheduleDateForEndedAt.getDate() + 1,
      );
    }

    if (timezone) {
      productScheduleDateForStartedAt = zonedTimeToUtc(
        productScheduleDateForStartedAt,
        timezone,
      );

      productScheduleDateForEndedAt = zonedTimeToUtc(
        productScheduleDateForEndedAt,
        timezone,
      );
    }

    entity.productScheduleStartedAtTimestamp = productScheduleDateForStartedAt;

    entity.productScheduleEndedAtTimestamp = productScheduleDateForEndedAt;

    return entity;
  }
}
