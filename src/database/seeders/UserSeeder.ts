// import type { EntityManager } from '@mikro-orm/core';
// import { Seeder } from '@mikro-orm/seeder';
// import { UserFactory } from '~/database/factories/user.factory';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole } from '~/user/entities/user.entity';

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
    // const userRepository = dataSource.getRepository(User);

    // await userRepository.insert([
    //     {
    //         firstName: 'Caleb',
    //         lastName: 'Barrows',
    //         email: 'caleb.barrows@gmail.com'
    //     }
    // ]);

    // ---------------------------------------------------

    const userFactory = await factoryManager.get(User);

    for (let index = 1; index <= 5; index++) {
      await userFactory.save({
        userName: `admin${index}`,
        role: UserRole.ADMIN
      });

      await userFactory.save({
        userName: `user${index}`,
        role: UserRole.USER
      });
    }
  }
}