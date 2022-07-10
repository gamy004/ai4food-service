import { Controller, Post, Body, Inject } from '@nestjs/common';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import { ProductSchedule } from './entities/product-schedule.entity';
import { ImportProductScheduleDto } from './dto/import-product-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { ImportTransactionService } from '~/import-transaction/import-transaction.service';
// Infra Layer
@Controller('product-schedule')
export class ProductScheduleController {
  constructor(
    private readonly importTransactionService: ImportTransactionService,
    @Inject('DataCollectorImporterInterface<ProductSchedule>')
    private readonly productScheduleImporter: DataCollectorImporterInterface<ProductSchedule>
  ) { }

  @Post('import')
  async importProductSchedule(@Body() importProductScheduleDto: ImportProductScheduleDto): Promise<void> {
    const importTransaction = await this.importTransactionService.findOne(
      importProductScheduleDto.importTransaction
    );

    return this.productScheduleImporter.import(
      importTransaction,
      ProductSchedule.create<ProductSchedule>(importProductScheduleDto.records)
    );
  }
}
