import { Module } from '@nestjs/common';
import { ProductScheduleService } from './product-schedule.service';
import { ProductScheduleController } from './product-schedule.controller';

@Module({
  controllers: [ProductScheduleController],
  providers: [ProductScheduleService]
})
export class ProductScheduleModule { }
