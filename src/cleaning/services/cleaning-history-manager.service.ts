import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '~/auth/entities/user.entity';
import {
  BodyUpdateCleaningHistoryDto,
  ParamUpdateCleaningHistoryDto,
} from '../dto/update-cleaning-history.dto';
import { CleaningHistoryCleaningValidation } from '../entities/cleaning-history-cleaning-validation.entity';
import { CleaningHistory } from '../entities/cleaning-history.entity';
import { CleaningHistoryService } from './cleaning-history.service';
import { CleaningProgramService } from './cleaning-program.service';

@Injectable()
export class CleaningHistoryManagerService {
  constructor(
    private readonly cleaningHistoryService: CleaningHistoryService,
    private readonly cleaningProgramService: CleaningProgramService,
    @InjectRepository(CleaningHistoryCleaningValidation)
    protected readonly cleaningHistoryCleaningValidationRepository: Repository<CleaningHistoryCleaningValidation>,
  ) {}

  async update(
    cleaningHistory: CleaningHistory,
    body: BodyUpdateCleaningHistoryDto,
    recordedUser?: User,
  ): Promise<CleaningHistory> {
    const {
      cleaningProgramId,
      cleaningHistoryStartedAt,
      cleaningHistoryEndedAt,
      cleaningHistoryValidations = [],
    } = body;

    const cleaningProgram = await this.cleaningProgramService.make({
      id: cleaningProgramId,
    });

    cleaningHistory.cleaningHistoryStartedAt = cleaningHistoryStartedAt;
    cleaningHistory.cleaningHistoryEndedAt = cleaningHistoryEndedAt;
    cleaningHistory.cleaningProgram = cleaningProgram;

    if (recordedUser) {
      cleaningHistory.recordedUser = recordedUser;
    }

    if (cleaningHistoryValidations.length) {
      let cleaningHistoryValidations = [];

      for (let index = 0; index < cleaningHistoryValidations.length; index++) {
        const element = cleaningHistoryValidations[index];

        const cleaningHistoryValidationEntity =
          this.cleaningHistoryCleaningValidationRepository.create({
            cleaningValidationId: element.cleaningValidationId,
            pass: element.pass,
          });

        if (element.id) {
          const targetCleaningHistoryValidation =
            await this.cleaningHistoryCleaningValidationRepository.findOneBy({
              id: element.id,
            });

          if (targetCleaningHistoryValidation) {
            cleaningHistoryValidationEntity.id =
              targetCleaningHistoryValidation.id;
          }
        }

        cleaningHistoryValidations.push(cleaningHistoryValidationEntity);
      }

      cleaningHistory.cleaningHistoryValidations = cleaningHistoryValidations;
    }

    return this.cleaningHistoryService.save(cleaningHistory);
  }
}
