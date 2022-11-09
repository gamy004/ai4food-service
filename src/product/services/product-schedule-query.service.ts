import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { QueryProductScheduleDto } from '../dto/query-product-schedule.dto';
import { ResponseQueryProductScheduleDto } from '../dto/response-query-product-schedule.dto';
import { ProductSchedule } from '../entities/product-schedule.entity';
import { ProductScheduleService } from './product-schedule.service';

@Injectable()
export class ProductScheduleQueryService {
  constructor(
    private readonly productScheduleService: ProductScheduleService,
  ) {}

  async findMany(
    dto: QueryProductScheduleDto,
  ): Promise<ResponseQueryProductScheduleDto> {
    const options: FindManyOptions<ProductSchedule> =
      this.productScheduleService.toFindManyOptions(dto);

    const productSchedules = await this.productScheduleService.find(options);

    return { productSchedules };
  }
}
