import { format } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporter } from '~/data-collector/data-collector.importer';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { ProductSchedule } from '../entities/product-schedule.entity';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { Shift } from '~/common/enums/shift';
import { zonedTimeToUtc } from 'date-fns-tz';

// Detail!!! (Application Layer)
export class ProductScheduleImporter extends DataCollectorImporter<ProductSchedule> {
  importType: ImportType = ImportType.PRODUCT_SCHEDULE;

  mappingKeys: string[] = [
    'productId',
    'productScheduleDate',
    'productScheduleStartedAt',
    'productScheduleEndedAt',
  ];

  constructor(
    private readonly dateTransformer: DateTransformer,
    transaction: TransactionDatasource,
    @InjectRepository(ProductSchedule)
    repository: CommonRepositoryInterface<ProductSchedule>,
  ) {
    super(transaction, repository);
  }

  map(record: ProductSchedule) {
    const {
      productScheduleDate,
      productScheduleStartedAt,
      productScheduleEndedAt,
      product,
    } = record;

    const { id: productId } = product;

    return {
      productId,
      productScheduleDate,
      productScheduleStartedAt,
      productScheduleEndedAt,
    };
  }

  preProcess(records: ProductSchedule[]) {
    const timezone = this.getTimezone();

    return records.map((record) => {
      const timeObjectProductScheduleStartedAt =
        this.dateTransformer.toTimeObject(record.productScheduleStartedAt);

      let productScheduleDateForStartedAt = this.dateTransformer.toObject(
        record.productScheduleDate,
        timeObjectProductScheduleStartedAt,
      );

      const timeObjectProductScheduleEndedAt =
        this.dateTransformer.toTimeObject(record.productScheduleEndedAt);

      let productScheduleDateForEndedAt = this.dateTransformer.toObject(
        record.productScheduleDate,
        timeObjectProductScheduleEndedAt,
      );

      // for time in shift NIGHT and has started at hour between 00:00 am - 07:00 am, map to next day
      if (
        record.shift === Shift.NIGHT &&
        timeObjectProductScheduleStartedAt.hours >= 0 &&
        timeObjectProductScheduleStartedAt.hours < 7
      ) {
        productScheduleDateForStartedAt.setDate(
          productScheduleDateForStartedAt.getDate() + 1,
        );
      }

      // for time in shift NIGHT and has ended at hour between 00:00 am - 07:00 am, map to next day
      if (
        record.shift === Shift.NIGHT &&
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

      record.productScheduleStartedAtTimestamp =
        productScheduleDateForStartedAt;

      record.productScheduleEndedAtTimestamp = productScheduleDateForEndedAt;

      return record;
    });
  }
}
