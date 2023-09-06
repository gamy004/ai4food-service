import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabTest } from '../entities/swab-test.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';

@Injectable()
export class SwabTestService extends CrudService<SwabTest> {
  constructor(
    @InjectRepository(SwabTest)
    repository: CommonRepositoryInterface<SwabTest>,
  ) {
    super(repository);
  }
}
