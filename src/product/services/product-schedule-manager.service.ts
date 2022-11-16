import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { QueryProductScheduleDto } from '../dto/query-product-schedule.dto';
import { ResponseQueryProductScheduleDto } from '../dto/response-query-product-schedule.dto';
import { BodyUpdateProductScheduleDto } from '../dto/update-product-schedule.dto';
import { ProductSchedule } from '../entities/product-schedule.entity';
import { ProductScheduleService } from './product-schedule.service';
import { ProductService } from './product.service';

@Injectable()
export class ProductScheduleManagerService {
  constructor(
    private readonly productService: ProductService,
    private readonly productScheduleService: ProductScheduleService,
  ) {}

  async commandUpdateProductScheduleById(
    id: string,
    dto: BodyUpdateProductScheduleDto,
  ): Promise<ProductSchedule> {
    const productSchedule = await this.productScheduleService.findOneByOrFail({
      id,
    });

    productSchedule.productScheduleAmount = dto.productScheduleAmount;
    productSchedule.productScheduleDate = new Date(dto.productScheduleDate);
    productSchedule.productScheduleStartedAt = dto.productScheduleStartedAt;
    productSchedule.productScheduleEndedAt = dto.productScheduleEndedAt;
    productSchedule.product = this.productService.make({ id: dto.product.id });

    this.productScheduleService.save(productSchedule);

    return productSchedule;
  }
}