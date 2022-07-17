import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabArea } from '../entities/swab-area.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { IsNull } from 'typeorm';

@Injectable()
export class SwabAreaService extends CrudService<SwabArea> {
  constructor(
    @InjectRepository(SwabArea)
    repository: CommonRepositoryInterface<SwabArea>
  ) {
    super(repository)
  }

  findAllMainArea(): Promise<SwabArea[]> {
    return this.repository.findBy({ mainSwabAreaId: IsNull() });
  }
}

