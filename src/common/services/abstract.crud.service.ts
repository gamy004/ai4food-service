import { Injectable } from '@nestjs/common';
import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CrudServiceInterface } from '../interface/crud.service.interface';

@Injectable()
export abstract class CrudService<Entity> implements CrudServiceInterface<Entity> {
  constructor(
    protected readonly repository: Repository<Entity>
  ) { }

  make(initDto: DeepPartial<Entity>): DeepPartial<Entity> & Entity {
    return this.repository.create(initDto);
  }

  create(createDto: DeepPartial<Entity>): Promise<DeepPartial<Entity> & Entity> {
    return this.repository.save(createDto);
  }

  find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repository.find(options);
  }

  findBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<Entity[]> {
    return this.repository.findBy(where);
  }

  findOne(options: FindOneOptions<Entity>): Promise<Entity> {
    return this.repository.findOne(options);
  }

  findOneBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<Entity> {
    return this.repository.findOneBy(where);
  }

  findOneOrFail(options: FindOneOptions<Entity>): Promise<Entity> {
    return this.repository.findOneOrFail(options);
  }

  findOneByOrFail(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<Entity> {
    return this.repository.findOneByOrFail(where);
  }

  save(entity: Entity, options?: SaveOptions): Promise<DeepPartial<Entity> & Entity> {
    return this.repository.save(entity, options);
  }

  update(where: FindOptionsWhere<Entity>, updateDto: QueryDeepPartialEntity<Entity>): Promise<UpdateResult> {
    return this.repository.update(where, updateDto);
  }

  removeOne(entity: Entity, options?: SaveOptions): Promise<Entity> {
    return this.repository.softRemove(entity, options);
  }

  removeMany(entities: Entity[], options?: SaveOptions): Promise<Entity[]> {
    return this.repository.softRemove(entities, options);
  }
}
