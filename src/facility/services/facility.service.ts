import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { Facility } from '../entities/facility.entity';

@Injectable()
export class FacilityService extends CrudService<Facility> {
  constructor(
    @InjectRepository(Facility)
    repository: CommonRepositoryInterface<Facility>,
  ) {
    super(repository);
  }
}
