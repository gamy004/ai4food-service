import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { FacilityItem } from './entities/facility-item.entity';

@Injectable()
export class FacilityItemService extends CrudService<FacilityItem> {
  constructor(
    @InjectRepository(FacilityItem)
    repository: CommonRepositoryInterface<FacilityItem>
  ) {
    super(repository);
  }
}
