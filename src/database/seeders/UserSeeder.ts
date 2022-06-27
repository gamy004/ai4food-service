import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole } from '~/user/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // ---------------------------------------------------

    const userFactory = await factoryManager.get(User);

    let seedUsers = [];

    for (let index = 1; index <= 5; index++) {

      const adminUser = await userFactory.make({
        userName: `admin${index}`,
        role: UserRole.ADMIN
      });

      const normalUser = await userFactory.make({
        userName: `user${index}`,
        role: UserRole.USER
      });

      seedUsers = [
        ...seedUsers,
        adminUser,
        normalUser
      ];
    }

    await userRepository.save(seedUsers);
  }
}