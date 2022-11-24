import { PartialType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ConnectProductScheduleDto } from './connect-product-schedule.dto';
import { CreateProductScheduleDto } from './create-product-schedule.dto';

export class ParamUpdateProductScheduleDto extends PickType(
  ConnectProductScheduleDto,
  ['id'],
) {}

export class BodyUpdateProductScheduleDto extends PartialType(
  CreateProductScheduleDto,
) {
  @IsOptional()
  timezone?: string;
}
