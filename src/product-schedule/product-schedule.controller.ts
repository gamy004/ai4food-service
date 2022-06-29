import { Controller, Post, Body, Inject } from '@nestjs/common';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import { ProductSchedule } from './entities/product-schedule.entity';
import { ImportProductScheduleDto } from './dto/import-product-schedule.dto';
// Infra Layer
@Controller('product-schedule')
export class ProductScheduleController {
  constructor(
    @Inject('DataCollectorImporterInterface<ProductSchedule>')
    private readonly productScheduleImporter: DataCollectorImporterInterface<ProductSchedule>
  ) { }

  @Post()
  importProductSchedule(@Body() importProductScheduleDto: ImportProductScheduleDto): Promise<void> {
    return this.productScheduleImporter.import(
      importProductScheduleDto.importTransaction,
      ProductSchedule.create<ProductSchedule>(importProductScheduleDto.records)
    );
  }
}
