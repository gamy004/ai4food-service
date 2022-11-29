import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SensorMapping } from '../entities/sensor-mapping.entity';

@Injectable()
export class SensorMappingService extends CrudService<SensorMapping> {
  constructor(
    @InjectRepository(SensorMapping)
    repository: CommonRepositoryInterface<SensorMapping>,
  ) {
    super(repository);
  }
}
