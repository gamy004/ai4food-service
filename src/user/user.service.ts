// import { EntityRepository, FilterQuery, FindOneOptions, FindOptions } from '@mikro-orm/core';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const createdUser = this.userRepository.create(createUserDto);

    await createdUser.save();

    return createdUser;
  }

  findAll(options?: FindManyOptions<User>) {
    return this.userRepository.find(options);
  }

  find(where: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    return this.userRepository.findBy(where);
  }

  findId(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async findOne(userName: string) {
    return this.userRepository.findOneBy({ userName });
  }

  async update(where: FindOptionsWhere<User>, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.update(where, updateUserDto);

    return updatedUser;
  }

  async updateId(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.update({ id }, updateUserDto);

    return updatedUser;
  }

  async softRemove(where: FindOptionsWhere<User>) {
    const user = await this.userRepository.softDelete(where);

    return user;
  }

  async softRemoveId(id: string) {
    const user = await this.userRepository.softDelete({ id });

    return user;
  }
}
