import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabArea } from '../entities/swab-area.entity';

@Injectable()
export class SwabAreaService extends CrudService<SwabArea>{
  constructor(
    @InjectRepository(SwabArea)
    repository: Repository<SwabArea>
  ) {
    super(repository);
  }

  findAll(options?: FindManyOptions<SwabArea>) {
    return this.repository.find(options);
  }

  find(where: FindOptionsWhere<SwabArea> | FindOptionsWhere<SwabArea>[]) {
    return this.repository.findBy(where);
  }
}
