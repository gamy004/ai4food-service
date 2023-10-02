import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabPlan } from '../entities/swab-plan.entity';
import { FilterSwabPlanDto } from '../dto/filter-swab-plan.dto';
import { FindOptionsWhere, Raw } from 'typeorm';
import { DateTransformer } from '~/common/transformers/date-transformer';

@Injectable()
export class SwabPlanCrudService extends CrudService<SwabPlan> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(SwabPlan)
    repository: CommonRepositoryInterface<SwabPlan>,
  ) {
    super(repository);
  }

  toFilter(dto: FilterSwabPlanDto): FindOptionsWhere<SwabPlan> {
    const where: FindOptionsWhere<SwabPlan> = {};

    const { id, shift, swabPeriodId, month, year } = dto;

    if (id) {
      where.id = id;
    }

    if (shift) {
      where.shift = shift;
    }

    if (swabPeriodId) {
      where.swabPeriodId = swabPeriodId;
    }

    if (month || year) {
      where.swabPlanDate = Raw((field) =>
        this.dateTransformer.dateToSql(field, { day: null, month, year }),
      );
    }

    return where;
  }
}
