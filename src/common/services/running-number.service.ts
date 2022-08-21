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
    const { key, offset = 1 } = dto;

    let latestRunningNumber = null;

    await this.transaction.execute(
      async (queryRunnerManger) => {
        const repository = queryRunnerManger.getRepository(RunningNumber);

        const runningNumber = await repository.findOne({
          where: { key },
          lock: {
            mode: "pessimistic_write",
          },
          transaction: true
        });

        if (!runningNumber) {
          latestRunningNumber = 1;

          console.log(`Insert running number key: ${key} with latest running number: ${latestRunningNumber}`);

          await repository.save(
            { key, latestRunningNumber },
            { transaction: true }
          );
        } else {
          runningNumber.latestRunningNumber += offset;

          latestRunningNumber = runningNumber.latestRunningNumber;

          console.log(`Update running number key: ${key} with latest running number: ${latestRunningNumber}`);

          await repository.save(
            runningNumber,
            { transaction: true }
          );
        }
      }
    );

    if (!latestRunningNumber) {
      throw new Error("Generate running number failed");
    }

    return latestRunningNumber;
  }
}
