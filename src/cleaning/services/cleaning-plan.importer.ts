import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporter } from '~/data-collector/data-collector.importer';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { CleaningPlan } from '../entities/cleaning-plan.entity';

export class CleaningPlanImporter extends DataCollectorImporter<CleaningPlan> {
  importType: ImportType = ImportType.CLEANING_PLAN;

  mappingKeys: string[] = ['cleaningPlanName'];

  constructor(
    transaction: TransactionDatasource,
    @InjectRepository(CleaningPlan)
    repository: CommonRepositoryInterface<CleaningPlan>,
  ) {
    super(transaction, repository);
  }

  map(record: CleaningPlan) {
    const { cleaningPlanName } = record;

    return {
      cleaningPlanName,
    };
  }

  preProcess(records: CleaningPlan[]) {
    return records;
  }
}
