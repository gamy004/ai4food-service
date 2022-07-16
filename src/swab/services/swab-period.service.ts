import { Injectable } from '@nestjs/common';
import { CreateSwabPeriodDto } from '../dto/create-swab-period.dto';
import { UpdateSwabPeriodDto } from '../dto/update-swab-period.dto';

@Injectable()
export class SwabPeriodService {
  create(createSwabPeriodDto: CreateSwabPeriodDto) {
    return 'This action adds a new swabPeriod';
  }

  findAll() {
    return `This action returns all swabPeriod`;
  }

  findOne(id: number) {
    return `This action returns a #${id} swabPeriod`;
  }

  update(id: number, updateSwabPeriodDto: UpdateSwabPeriodDto) {
    return `This action updates a #${id} swabPeriod`;
  }

  remove(id: number) {
    return `This action removes a #${id} swabPeriod`;
  }
}
