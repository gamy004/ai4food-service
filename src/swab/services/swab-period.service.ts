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

  // create(createSwabPeriodDto: CreateSwabPeriodDto) {
  //   return 'This action adds a new swabPeriod';
  // }

  find(where: FindOptionsWhere<SwabPeriod> | FindOptionsWhere<SwabPeriod>[]) {
    return this.repository.findBy(where);
  }

  // findAll() {
  //   return `This action returns all swabPeriod`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} swabPeriod`;
  // }

  // update(id: number, updateSwabPeriodDto: UpdateSwabPeriodDto) {
  //   return `This action updates a #${id} swabPeriod`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} swabPeriod`;
  // }
}
