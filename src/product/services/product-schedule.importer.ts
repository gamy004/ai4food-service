import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporter } from '~/data-collector/data-collector.importer';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { ProductSchedule } from '../entities/product-schedule.entity';
import { ProductScheduleService } from './product-schedule.service';

export class ProductScheduleImporter extends DataCollectorImporter<ProductSchedule> {
  importType: ImportType = ImportType.PRODUCT_SCHEDULE;

  mappingKeys: string[] = [
    'productId',
    'productScheduleDate',
    'productScheduleStartedAt',
    'productScheduleEndedAt',
  ];

  constructor(
    private readonly productScheduleService: ProductScheduleService,
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
      record = this.productScheduleService.computeTimestamp(record, timezone);

      return record;
    });
  }
}
