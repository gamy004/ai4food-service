import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BodyUpdateCleaningHistoryDto,
  ParamUpdateCleaningHistoryDto,
} from '../dto/update-cleaning-history.dto';
import { CleaningHistoryCleaningValidation } from '../entities/cleaning-history-cleaning-validation.entity';
import { CleaningHistory } from '../entities/cleaning-history.entity';
import { CleaningProgram } from '../entities/cleaning-program.entity';

@Injectable()
export class CleaningHistoryService {
  constructor(
    @InjectRepository(CleaningHistory)
    protected readonly repository: Repository<CleaningHistory>,
    @InjectRepository(CleaningProgram)
    protected readonly cleaningProgramRepository: Repository<CleaningProgram>,
    @InjectRepository(CleaningHistoryCleaningValidation)
    protected readonly cleaningHistoryCleaningValidationRepository: Repository<CleaningHistoryCleaningValidation>,
  ) {}

  async updateCleaningHistory(
    param: ParamUpdateCleaningHistoryDto,
    body: BodyUpdateCleaningHistoryDto,
  ): Promise<CleaningHistory> {
    const {
      cleaningProgramId,
      cleaningHistoryStartedAt = '',
      cleaningHistoryEndedAt = '',
      cleaningHistoryValidations = [],
    } = body;

    const cleaningHistory = await this.repository.findOne({
      where: param,
      relations: {
        cleaningProgram: true,
        cleaningHistoryValidations: true,
      },
      select: {
        cleaningProgram: {
          id: true,
        },
        cleaningHistoryValidations: {
          id: true,
          pass: true,
        },
      },
    });

    if (cleaningProgramId) {
      const cleaningProgram = await this.cleaningProgramRepository.findOne({
        where: {
          id: cleaningProgramId,
        },
      });
      cleaningHistory.cleaningProgram = cleaningProgram;
    }

    if (cleaningHistoryStartedAt) {
      cleaningHistory.cleaningHistoryStartedAt = cleaningHistoryStartedAt;
    }

    if (cleaningHistoryEndedAt) {
      cleaningHistory.cleaningHistoryEndedAt = cleaningHistoryEndedAt;
    }

    if (cleaningHistoryValidations.length) {
      let cleaningHistoryValidationsBody = [];

      for (let index = 0; index < cleaningHistoryValidations.length; index++) {
        const element = cleaningHistoryValidations[index];
        const response =
          await this.cleaningHistoryCleaningValidationRepository.findOneByOrFail(
            { id: element.id },
          );

        cleaningHistoryValidationsBody.push({
          ...response,
          pass: element.pass,
        });
      }

      cleaningHistory.cleaningHistoryValidations =
        cleaningHistoryValidationsBody;
    }

    return this.repository.save(cleaningHistory);
  }
}
