import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabPeriod } from '../entities/swab-period.entity';

@Injectable()
export class SwabPeriodService extends CrudService<SwabPeriod> {
  constructor(
    @InjectRepository(SwabPeriod)
    repository: CommonRepositoryInterface<SwabPeriod>
  ) {
    super(repository);
  }
}
