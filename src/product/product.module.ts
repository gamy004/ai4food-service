import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductExistsRule } from './validators/product-exists-validator';
import { ProductSchedule } from './entities/product-schedule.entity';
import { CommonModule } from '~/common/common.module';
import { ImportTransactionModule } from '~/import-transaction/import-transaction.module';
import { ProductScheduleImporter } from './services/product-schedule.importer';
import { ProductScheduleQueryService } from './services/product-schedule-query.service';
import { ProductScheduleController } from './controllers/product-schedule.controller';
import { ProductController } from './controllers/product.controller';
import { ProductScheduleService } from './services/product-schedule.service';
import { ProductService } from './services/product.service';
import { ProductScheduleManagerService } from './services/product-schedule-manager.service';
import { ProductScheduleExistsRule } from './validators/product-schedule-exists-validator';

@Module({
  imports: [
    ImportTransactionModule,
    CommonModule,
    TypeOrmModule.forFeature([Product, ProductSchedule]),
  ],

  controllers: [ProductController, ProductScheduleController],

  providers: [
    // {
    //   provide: 'CrudService<Product>',
    //   useClass: ProductService
    // },
    ProductService,
    ProductExistsRule,
    {
      provide: 'DataCollectorImporterInterface<ProductSchedule>',
      useClass: ProductScheduleImporter,
    },
    ProductScheduleExistsRule,
    ProductScheduleService,
    ProductScheduleQueryService,
    ProductScheduleManagerService,
  ],

  exports: [ProductService, ProductExistsRule],
})
export class ProductModule {}
