import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CreateSwabPeriodDto } from '../dto/create-swab-period.dto';
import { UpdateSwabPeriodDto } from '../dto/update-swab-period.dto';
import { SwabPeriod } from '../entities/swab-period.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';


@Injectable()
export class SwabPeriodService extends CrudService<SwabPeriod>{
  constructor(
    @InjectRepository(SwabPeriod)
    repository: CommonRepositoryInterface<SwabPeriod>

  ) {
    super(repository);
  }
}
