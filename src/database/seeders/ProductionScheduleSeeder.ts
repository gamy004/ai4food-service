import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ImportTransaction, ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { ProductSchedule } from '~/product-schedule/entities/product-schedule.entity';
import { Product } from '~/product/entities/product.entity';

export default class ProductScheduleSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const importTransactionRepository = dataSource.getRepository(ImportTransaction);

    // ---------------------------------------------------

    const importTransactionFactory = await factoryManager.get(ImportTransaction);
    const productFactory = await factoryManager.get(Product);
    const productScheduleFactory = await factoryManager.get(ProductSchedule);

    let productSchedules = [];

    const importTransaction = await importTransactionFactory.make({
      importType: ImportType.PRODUCTION_SCHEDULE
    });

    for (let index = 1; index <= 5; index++) {
      const product = await productFactory.save();

      for (let index = 1; index <= 5; index++) {
        const productSchedule = await productScheduleFactory.make({
          product
        });

        productSchedules.push(productSchedule);
      }
    }

    importTransaction.productSchedules = productSchedules;

    await importTransactionRepository.save(importTransaction);
  }
}