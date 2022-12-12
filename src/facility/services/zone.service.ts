import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { Zone } from '../entities/zone.entity';

@Injectable()
export class ZoneService extends CrudService<Zone> {
  constructor(
    @InjectRepository(Zone)
    repository: CommonRepositoryInterface<Zone>
  ) {
    super(repository);
  }
}
