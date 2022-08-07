// import { EntityRepository, FilterQuery, FindOneOptions, FindOptions } from '@mikro-orm/core';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    repository: CommonRepositoryInterface<User>
  ) {
    super(repository);
  }

  async findByUsername(userName: string) {
    return this.repository.findOneBy({ userName });
  }
}
