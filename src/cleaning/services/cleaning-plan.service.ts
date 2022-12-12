import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CleaningPlan } from '../entities/cleaning-plan.entity';

@Injectable()
export class CleaningPlanService extends CrudService<CleaningPlan> {
  constructor(
    @InjectRepository(CleaningPlan)
    repository: CommonRepositoryInterface<CleaningPlan>,
  ) {
    super(repository);
  }
}
