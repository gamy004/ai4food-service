import { EntityManager, FindOptionsWhere } from 'typeorm';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import {
  ImportTransaction,
  ImportType,
} from '~/import-transaction/entities/import-transaction.entity';

// Policy!!! (Application Layer)
export abstract class DataCollectorImporter<Entity>
  implements DataCollectorImporterInterface<Entity>
{
  abstract importType: ImportType;

  abstract mappingKeys: string[];

  protected existsRecords: Record<string, Entity>;

  protected timezone: string;

  constructor(
    protected readonly transaction: TransactionDatasource,
    protected readonly repository: CommonRepositoryInterface<Entity>,
  ) {
    this.existsRecords = {};
  }

  /**
   * Method to map the record into FindOptionsWhere
   *
   * @param records The new record that will be imported
   *
   * @return FindOptionsWhere<Entity>
   */
  abstract map(record: Entity): FindOptionsWhere<Entity>;

  abstract preProcess(records: Entity[]): Entity[];

  private getMappingKey(record): string {
    return this.mappingKeys.map((mappingKey) => record[mappingKey]).join('_');
  }

  private isEnitityExists(entity: Entity): boolean {
    return this.existsRecords[this.getMappingKey(entity)] !== undefined;
  }

  public getExistsEntity(entity: Entity): Entity | null {
    return this.existsRecords[this.getMappingKey(entity)] || null;
  }

  public setTimezone(timezone: string): void {
    this.timezone = timezone;
  }

  public getTimezone(): string {
    return this.timezone;
  }

  /**
   * Method to pre-process the data before inserting to db
   *
   * @param queryRunnerManger The entity manager from transaction
   *
   * @param records The new records that will be imported
   *
   * @return Promise<Entity[], Entity[]>
   */
  private async queryExistRecords(
    queryRunnerManger: EntityManager,
    records: Entity[],
  ): Promise<void> {
    // const filteredRecordMapping = {};

    const existRecords = await queryRunnerManger.findBy(
      this.repository.target,
      records.map(this.map),
    );

    if (existRecords.length) {
      existRecords.forEach((existsRecord) => {
        this.existsRecords[this.getMappingKey(existsRecord)] = existsRecord;

        // filteredRecordMapping[this.getMappingKey(existsRecord)] = true;
      });
    }

    // const savedRecords = records.filter(
    //   (record) => !filteredRecordMapping[this.getMappingKey(record)],
    // );

    // return [savedRecords, existRecords];
  }

  async import(
    importTransaction: ImportTransaction,
    records: Entity[],
  ): Promise<void> {
    records = this.preProcess(records);

    await this.transaction.execute(async (queryRunnerManger) => {
      await this.queryExistRecords(queryRunnerManger, records);

      records = records.map((record: Entity) => {
        if (this.isEnitityExists(record)) {
          const existsEntity = this.getExistsEntity(record);

          record = this.repository.merge(existsEntity, record);
        }

        return record;
      });

      await queryRunnerManger.save(
        records.map((entity) =>
          this.repository.create({ ...entity, importTransaction }),
        ),
      );
      // const existEntities = await this.repository.findBy(
      //   records.map(this.filterRecordBy),
      // );

      // await Promise.allSettled([
      // queryRunnerManger.softRemove(existEntities),
      // queryRunnerManger.save(
      //   records.map((entity) =>
      //     this.repository.create({ ...entity, importTransaction }),
      //   ),
      // ),
      // ]);
    });
  }
}
