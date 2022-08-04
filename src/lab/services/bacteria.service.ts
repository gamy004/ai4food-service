import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { Bacteria } from '../entities/bacteria.entity';

@Injectable()
export class BacteriaService extends CrudService<Bacteria> {
  constructor(
    @InjectRepository(Bacteria)
    repository: CommonRepositoryInterface<Bacteria>
  ) {
    super(repository);
  }
}
