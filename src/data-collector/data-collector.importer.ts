import { Inject } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import {
  ImportTransaction,
  ImportType,
} from '~/import-transaction/entities/import-transaction.entity';

// Policy!!! (Application Layer)
export type CheckOutput<E> = {
  // newRecords: E[],
  existRecords: E[];
};
export abstract class DataCollectorImporter<Entity>
  implements DataCollectorImporterInterface<Entity>
{
  constructor(
    protected readonly transaction: TransactionDatasource,
    protected readonly repository: CommonRepositoryInterface<Entity>,
  ) {}

  abstract importType: ImportType;

  abstract mappingKeys: string[];

  /**
   * Method to set value of record that will be filtered out
   *
   * @param records The new record that will be imported
   *
   * @return FindOptionsWhere<Entity>
   */
  abstract filterRecordBy(record: Entity): FindOptionsWhere<Entity>;

  private getMappingKey(record) {
    return this.mappingKeys.map((mappingKey) => record[mappingKey]).join('_');
  }

  /**
   * Method to pre-process the data before inserting to db
   *
   * @param records The new records that will be imported
   *
   * @return Promise<Entity[], Entity[]>
   */
  private async preProcess(records: Entity[]): Promise<[Entity[], Entity[]]> {
    const filteredRecordMapping = {};

    const existRecords = await this.repository.findBy(
      records.map(this.filterRecordBy),
    );

    if (existRecords.length) {
      existRecords.forEach((filteredRecord) => {
        filteredRecordMapping[this.getMappingKey(filteredRecord)] = true;
      });
    }

    const savedRecords = records.filter(
      (record) => !filteredRecordMapping[this.getMappingKey(record)],
    );

    return [savedRecords, existRecords];
  }

  async import(
    importTransaction: ImportTransaction,
    records: Entity[],
  ): Promise<void> {
    await this.transaction.execute(async (queryRunnerManger) => {
      // const [savedRecords, existRecords] = await this.preProcess(records);

      const existEntities = await this.repository.findBy(
        records.map(this.filterRecordBy),
      );

      await Promise.allSettled([
        queryRunnerManger.softRemove(existEntities),
        queryRunnerManger.save(
          records.map((entity) =>
            this.repository.create({ ...entity, importTransaction }),
          ),
        ),
      ]);
    });
  }
}
