import { EntityRepository, FilterQuery, FindOneOptions, FindOptions } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const createdUser = this.userRepository.create(createUserDto);

    await this.userRepository.persistAndFlush(createdUser);

    return createdUser;
  }

  findAll(options?: FindOptions<User>) {
    return this.userRepository.findAll(options);
  }

  find(where: FilterQuery<User>, options?: FindOptions<User>) {
    return this.userRepository.find(where, options);
  }

  findId(id: string, options?: FindOneOptions<User>) {
    return this.userRepository.findOne({ id }, options);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.findOneOrFail(id);

    updatedUser.assign(updateUserDto);

    await this.userRepository.persistAndFlush(updatedUser);

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneOrFail({ id });

    await this.userRepository.removeAndFlush(user);

    return user;
  }
}
