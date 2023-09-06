import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { BacteriaSpecie } from '../entities/bacteria-specie.entity';

@Injectable()
export class BacteriaSpecieService extends CrudService<BacteriaSpecie> {
  constructor(
    @InjectRepository(BacteriaSpecie)
    repository: CommonRepositoryInterface<BacteriaSpecie>,
  ) {
    super(repository);
  }
}
