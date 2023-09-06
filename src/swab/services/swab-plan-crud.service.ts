import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabPlan } from '../entities/swab-plan.entity';

@Injectable()
export class SwabPlanCrudService extends CrudService<SwabPlan> {
  constructor(
    @InjectRepository(SwabPlan)
    repository: CommonRepositoryInterface<SwabPlan>,
  ) {
    super(repository);
  }
}
