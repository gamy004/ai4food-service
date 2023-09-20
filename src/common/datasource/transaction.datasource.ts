import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionDatasource {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    promise:
      | ((queryRunnerManager: EntityManager) => Promise<void>)
      | ((queryRunnerManager: EntityManager) => Promise<void>)[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      if (Array.isArray(promise)) {
        await Promise.all(promise.map((p) => p(queryRunner.manager)));
      } else {
        await promise(queryRunner.manager);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
