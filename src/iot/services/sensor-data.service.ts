import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SensorData } from '../entities/sensor-data.entity';

@Injectable()
export class SensorDataService extends CrudService<SensorData> {
  constructor(
    @InjectRepository(SensorData)
    repository: CommonRepositoryInterface<SensorData>
  ) {
    super(repository);
  }
}
