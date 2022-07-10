// import { EntityRepository, FilterQuery, FindOneOptions, FindOptions } from '@mikro-orm/core';

import { Injectable } from '@nestjs/common';
import { DeepPartial, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CrudServiceInterface } from '../interface/crud.service.interface';

@Injectable()
export abstract class CrudService<Entity> implements CrudServiceInterface<Entity> {
  constructor(
    protected readonly repository: Repository<Entity>
  ) { }

  create(createDto: DeepPartial<Entity>): Promise<DeepPartial<Entity> & Entity> {
    return this.repository.save(createDto);
  }

  findAll(options?: FindManyOptions<Entity>) {
    return this.repository.find(options);
  }

  find(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]) {
    return this.repository.findBy(where);
  }

  findOne(where: FindOptionsWhere<Entity>) {
    return this.repository.findOneByOrFail(where);
  }

  async update(where: FindOptionsWhere<Entity>, updateDto: QueryDeepPartialEntity<Entity>) {
    return this.repository.update(where, updateDto);
  }

  async remove(where: FindOptionsWhere<Entity>) {
    return this.repository.softDelete(where);
  }
}
