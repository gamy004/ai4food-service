import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabSampleType } from '../entities/swab-sample-type.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';

@Injectable()
export class SwabSampleTypeService extends CrudService<SwabSampleType> {
  constructor(
    @InjectRepository(SwabSampleType)
    repository: CommonRepositoryInterface<SwabSampleType>,
  ) {
    super(repository);
  }
}
