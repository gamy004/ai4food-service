import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ImportStatus, ImportTransaction, ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { ProductSchedule } from '~/product-schedule/entities/product-schedule.entity';
import { Product } from '~/product/entities/product.entity';
import { ProductScheduleImporter } from '~/product-schedule/product-schedule.importer';
import { User, UserRole } from '~/auth/entities/user.entity';

export default class ProductScheduleSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    // const importTransactionRepository = dataSource.getRepository(ImportTransaction);

    // // // ---------------------------------------------------

    // const importTransactionFactory = await factoryManager.get(ImportTransaction);
    // const userFactory = await factoryManager.get(User);
    // const productFactory = await factoryManager.get(Product);
    // const productScheduleFactory = await factoryManager.get(ProductSchedule);

    // let productSchedules = [];


    // for (let index = 1; index <= 5; index++) {
    //   const product = await productFactory.save();

    //   for (let index = 1; index <= 5; index++) {
    //     const productSchedule = await productScheduleFactory.make({
    //       product
    //     });

    //     productSchedules.push(productSchedule);
    //   }
    // }

    // const user = await userFactory.save({
    //   userName: 'userProduction1',
    //   role: UserRole.USER
    // });

    // const importTransaction = await importTransactionFactory.save({
    //   importType: ImportType.PRODUCT_SCHEDULE,
    //   importedUser: user
    // });

    // importTransaction.productSchedules = productSchedules;

    // const productScheduleImporter = new ProductScheduleImporter(dataSource.getRepository(ProductSchedule));

    // await productScheduleImporter.import(
    //   importTransaction,
    //   productSchedules
    // );

    // await importTransactionRepository.update({ id: importTransaction.id }, { importStatus: ImportStatus.Success });
  }
}