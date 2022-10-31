import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
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
