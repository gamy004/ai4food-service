import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { QuerySwabCleaningValidationDto } from '../dto/query-swab-cleaning-validation.dto';
import { SwabCleaningValidation } from '../entities/swab-cleaning-validation.entity';
import { SwabCleaningValidationService } from './swab-cleaning-validation.service';

@Injectable()
export class SwabCleaningValidationQueryService {
  constructor(
    private readonly swabCleaningValidationService: SwabCleaningValidationService,
  ) {}

  async query(
    dto: QuerySwabCleaningValidationDto,
  ): Promise<SwabCleaningValidation[]> {
    const where = this.swabCleaningValidationService.toFilter(dto);

    return await this.swabCleaningValidationService.find({
      where,
      relations: {
        cleaningValidation: true,
      },
    });
  }
}
