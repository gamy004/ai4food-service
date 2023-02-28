import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '~/auth/entities/user.entity';
import { CollectionTransformer } from '~/common/transformers/collection-transformer';
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
    private readonly collectionTransformer: CollectionTransformer,
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
      cleaningType,
      cleaningHistoryValidations = [],
    } = body;

    const cleaningProgram = await this.cleaningProgramService.make({
      id: cleaningProgramId,
    });

    cleaningHistory.cleaningHistoryRecordedAt = new Date();
    cleaningHistory.cleaningHistoryStartedAt = cleaningHistoryStartedAt;
    cleaningHistory.cleaningHistoryEndedAt = cleaningHistoryEndedAt;
    cleaningHistory.cleaningProgram = cleaningProgram;
    cleaningHistory.cleaningType = cleaningType;

    if (recordedUser) {
      cleaningHistory.recordedUser = recordedUser;
    }

    const originalCleaningHistoryValidations =
      await this.cleaningHistoryCleaningValidationRepository.findBy({
        cleaningHistoryId: cleaningHistory.id,
      });

    const updatedCleaningHistoryValidations = [];

    const mapOriginalCleaningHistoryValidations =
      this.collectionTransformer.toMap(
        originalCleaningHistoryValidations,
        'id',
      );

    if (cleaningHistoryValidations.length) {
      for (let index = 0; index < cleaningHistoryValidations.length; index++) {
        const cleaningHistoryValidation = cleaningHistoryValidations[index];

        const updatedCleaningHistoryValidation =
          this.cleaningHistoryCleaningValidationRepository.create({
            cleaningValidationId:
              cleaningHistoryValidation.cleaningValidationId,
            pass: cleaningHistoryValidation.pass,
          });

        if (cleaningHistoryValidation.id) {
          const targetCleaningHistoryValidation =
            mapOriginalCleaningHistoryValidations.get(
              cleaningHistoryValidation.id,
            );

          if (targetCleaningHistoryValidation) {
            targetCleaningHistoryValidation.pass =
              cleaningHistoryValidation.pass;

            updatedCleaningHistoryValidations.push(
              targetCleaningHistoryValidation,
            );

            mapOriginalCleaningHistoryValidations.delete(
              cleaningHistoryValidation.id,
            );
          }
        } else {
          updatedCleaningHistoryValidations.push(
            updatedCleaningHistoryValidation,
          );
        }
      }
    }

    mapOriginalCleaningHistoryValidations.forEach(
      (originalCleaningHistoryValidation) => {
        updatedCleaningHistoryValidations.push(
          originalCleaningHistoryValidation,
        );
      },
    );

    cleaningHistory.cleaningHistoryValidations =
      updatedCleaningHistoryValidations;

    return this.cleaningHistoryService.save(cleaningHistory);
  }
}
