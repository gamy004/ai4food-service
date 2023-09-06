import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CreateSwabEnvironmentDto } from '../dto/create-swab-environment.dto';
import { UpdateSwabEnvironmentDto } from '../dto/update-swab-environment.dto';
import { SwabEnvironment } from '../entities/swab-environment.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';

@Injectable()
export class SwabEnvironmentService extends CrudService<SwabEnvironment> {
  constructor(
    @InjectRepository(SwabEnvironment)
    repository: CommonRepositoryInterface<SwabEnvironment>,
  ) {
    super(repository);
  }
}
