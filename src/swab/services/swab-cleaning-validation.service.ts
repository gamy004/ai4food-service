import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { QuerySwabCleaningValidationDto } from '../dto/query-swab-cleaning-validation.dto';
import { SwabCleaningValidation } from '../entities/swab-cleaning-validation.entity';

@Injectable()
export class SwabCleaningValidationService extends CrudService<SwabCleaningValidation> {
  constructor(
    @InjectRepository(SwabCleaningValidation)
    repository: CommonRepositoryInterface<SwabCleaningValidation>,
  ) {
    super(repository);
  }

  toFilter(
    dto: QuerySwabCleaningValidationDto,
  ): FindOptionsWhere<SwabCleaningValidation> {
    let { swabAreaId, swabPeriodId } = dto;

    const where: FindOptionsWhere<SwabCleaningValidation> = {};

    if (swabAreaId) {
      where.swabAreaId = swabAreaId;
    }

    if (swabPeriodId) {
      where.swabPeriodId = swabPeriodId;
    }

    return where;
  }
}
