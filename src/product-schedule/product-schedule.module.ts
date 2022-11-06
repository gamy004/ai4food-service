import { Module } from '@nestjs/common';
import { ProductScheduleService } from './product-schedule.service';
import { ProductScheduleController } from './product-schedule.controller';
import { ProductScheduleImporter } from './product-schedule.importer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSchedule } from './entities/product-schedule.entity';
import { ImportTransactionModule } from '~/import-transaction/import-transaction.module';
import { CommonModule } from '~/common/common.module';
import { ProductScheduleQueryService } from './services/product-schedule-query.service';

@Module({
  imports: [
    ImportTransactionModule,
    CommonModule,
    TypeOrmModule.forFeature([ProductSchedule]),
  ],
  controllers: [ProductScheduleController],
  providers: [
    {
      provide: 'DataCollectorImporterInterface<ProductSchedule>',
      useClass: ProductScheduleImporter,
    },
    ProductScheduleService,
    ProductScheduleQueryService,
  ],
})
export class ProductScheduleModule {}
