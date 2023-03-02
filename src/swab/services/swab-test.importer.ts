import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabTest } from '../entities/swab-test.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporter } from '~/data-collector/data-collector.importer';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { SwabTestService } from './swab-test.service';

export class SwabTestImporter extends DataCollectorImporter<SwabTest> {
  importType: ImportType = ImportType.SWAB_TEST;

  mappingKeys: string[] = ['swabTestCode'];

  constructor(
    // private readonly swabTestService: SwabTestService,
    transaction: TransactionDatasource,
    @InjectRepository(SwabTest)
    repository: CommonRepositoryInterface<SwabTest>,
  ) {
    super(transaction, repository);
  }

  map(record: SwabTest) {
    const { swabTestCode } = record;

    return {
      swabTestCode,
    };
  }

  preProcess(records: SwabTest[]) {
    return records.map((record) => {
      return record;
    });
  }
}
