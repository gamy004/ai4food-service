import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionDatasource } from '../datasource/transaction.datasource';
import { GenerateRunningNumberDto } from '../dto/generate-running-number.dto';
import { RunningNumber } from '../entities/running-number.entity';
import { CommonRepositoryInterface } from '../interface/common.repository.interface';
import { CrudService } from './abstract.crud.service';

@Injectable()
export class RunningNumberService extends CrudService<RunningNumber> {
  constructor(
    private readonly transaction: TransactionDatasource,
    @InjectRepository(RunningNumber)
    repository: CommonRepositoryInterface<RunningNumber>
  ) {
    super(repository);
  }

  async generate(dto: GenerateRunningNumberDto): Promise<number | null> {
    const { key } = dto;

    let latestRunningNumber = null;

    await this.transaction.execute(
      async (queryRunnerManger) => {
        const runningNumber = await queryRunnerManger.getRepository(RunningNumber)
          .createQueryBuilder("runningNumber")
          .useTransaction(true)
          .setLock("pessimistic_write")
          .where("`runningNumber`.`key` = :key", { key })
          .getOne();

        if (!runningNumber) {
          latestRunningNumber = 1;

          console.log(`Insert running number key: ${key} with latest running number: ${latestRunningNumber}`);

          await queryRunnerManger.getRepository(RunningNumber)
            .createQueryBuilder('insertRunningNumber')
            .insert()
            .values({ key, latestRunningNumber })
            .execute();
        } else {
          latestRunningNumber = runningNumber.latestRunningNumber + 1;

          console.log(`Update running number key: ${key} with latest running number: ${latestRunningNumber}`);

          await queryRunnerManger.getRepository(RunningNumber)
            .createQueryBuilder('updateRunningNumber')
            .update()
            .set({ latestRunningNumber })
            .execute();
        }
      }
    );

    if (!latestRunningNumber) {
      throw new Error("Generate running number failed");
    }

    return latestRunningNumber;
  }
}
