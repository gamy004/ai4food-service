import { PartialType } from '@nestjs/swagger';
import { CreateProductScheduleDto } from './create-product-schedule.dto';

export class UpdateProductScheduleDto extends PartialType(CreateProductScheduleDto) { }
