import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { hash } from "bcrypt";
import { DataSource } from 'typeorm';
import { User, UserRole, UserTeam } from '~/auth/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // ---------------------------------------------------

    const userFactory = await factoryManager.get(User);

    let seedUsers = [];

    for (let index = 1; index <= 1; index++) {
      const adminUserName = `admin${index}`;
      const adminUserPassword = await hash(`${adminUserName}password`, 14);

      const adminTeamUser = await userFactory.make({
        userName: adminUserName,
        password: adminUserPassword,
        role: UserRole.ADMIN,
        team: UserTeam.ADMIN
      });

      const swabUserName = `swab${index}`;
      const swabUserPassword = await hash(`${swabUserName}password`, 14);

      const swabTeamUser = await userFactory.make({
        userName: `swab${index}`,
        password: swabUserPassword,
        role: UserRole.USER,
        team: UserTeam.SWAB
      });

      seedUsers = [
        ...seedUsers,
        adminTeamUser,
        swabTeamUser
      ];
    }

    await userRepository.upsert(seedUsers, ['userName']);
  }
}