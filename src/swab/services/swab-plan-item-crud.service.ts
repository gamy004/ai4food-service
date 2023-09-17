import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabPlanItem } from '../entities/swab-plan-item.entity';

@Injectable()
export class SwabPlanItemCrudService extends CrudService<SwabPlanItem> {
  constructor(
    @InjectRepository(SwabPlanItem)
    repository: CommonRepositoryInterface<SwabPlanItem>,
  ) {
    super(repository);
  }
}
