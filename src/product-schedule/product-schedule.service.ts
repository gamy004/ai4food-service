import { Injectable } from '@nestjs/common';
import { CreateProductScheduleDto } from './dto/create-product-schedule.dto';
import { UpdateProductScheduleDto } from './dto/update-product-schedule.dto';

@Injectable()
export class ProductScheduleService {
  create(createProductScheduleDto: CreateProductScheduleDto) {
    return 'This action adds a new productSchedule';
  }

  findAll() {
    return `This action returns all productSchedule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSchedule`;
  }

  update(id: number, updateProductScheduleDto: UpdateProductScheduleDto) {
    return `This action updates a #${id} productSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSchedule`;
  }
}
