// import type { EntityManager } from '@mikro-orm/core';
// import { Seeder } from '@mikro-orm/seeder';
// import { UserFactory } from '~/database/factories/user.factory';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole } from '~/user/entities/user.entity';
import { ImportTransaction, ImportType } from '~/import-transaction/entities/import-transaction.entity';

// export class UserSeeder extends Seeder {

//   async run(em: EntityManager): Promise<void> {
//     const userFactory = new UserFactory(em);

//     // const userRepo = em.getRepository(User);

//     for (let index = 1; index <= 5; index++) {
//       await userFactory.create(5, {
//         userName: `admin${index}`,
//         role: UserRole.ADMIN
//       });

//       await userFactory.create(5, {
//         userName: `user${index}`,
//         role: UserRole.USER
//       });
//     }
//   }

// }

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // await userRepository.insert([
    //     {
    //         firstName: 'Caleb',
    //         lastName: 'Barrows',
    //         email: 'caleb.barrows@gmail.com'
    //     }
    // ]);

    // ---------------------------------------------------

    const userFactory = await factoryManager.get(User);
    const importTransactionFactory = await factoryManager.get(ImportTransaction);

    for (let index = 1; index <= 1; index++) {

      const adminUser = await userFactory.save({
        userName: `admin${index}`,
        role: UserRole.ADMIN,
        importTransactions: [
          await importTransactionFactory.make({
            importType: ImportType.PRODUCT_SCHEDULE
          })
        ]
      });

      console.log(adminUser);

      // mock update first import transaction record
      adminUser.importTransactions[0].importType = ImportType.CLEANING_PLAN;

      // mock add new import transaction record
      adminUser.importTransactions.push(
        await importTransactionFactory.make({
          importType: ImportType.PRODUCT_SCHEDULE
        })
      );

      await userRepository.save(adminUser);
      // await importTransactionFactory.save({
      //   importedUser: adminUser,
      //   importType: ImportType.PRODUCT_SCHEDULE
      // });

      // const userWithImportTransactions: User = await userRepository.findOne({
      //   where: { id: adminUser.id },
      //   relations: {
      //     importTransactions: true
      //   }
      // });

      console.log(adminUser);

      const softRemovedUser = await userRepository.softRemove(adminUser);

      console.log(softRemovedUser);

      await userFactory.save({
        userName: `user${index}`,
        role: UserRole.USER
      });
    }
  }
}