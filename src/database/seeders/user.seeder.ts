import { Seeder } from 'typeorm-extension';
import { hash } from "bcryptjs";
import { DataSource } from 'typeorm';
import { User, UserRole, UserTeam } from '~/auth/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // ---------------------------------------------------

    // const userFactory = await factoryManager.get(User);

    let seedUsers = [];

    for (let index = 1; index <= 1; index++) {
      const adminUserName = `admin${index}`;
      const adminUserPassword = await hash(`${adminUserName}password`, 14);

      const adminTeamUser = await userRepository.create({
        userName: adminUserName,
        password: adminUserPassword,
        firstName: adminUserName,
        lastName: null,
        role: UserRole.ADMIN,
        team: UserTeam.ADMIN
      });

      const swabUserName = `swab${index}`;
      const swabUserPassword = await hash(`${swabUserName}password`, 14);

      const swabTeamUser = await userRepository.create({
        userName: swabUserName,
        password: swabUserPassword,
        firstName: swabUserName,
        lastName: null,
        role: UserRole.USER,
        team: UserTeam.SWAB
      });

      const labUserName = `lab${index}`;
      const labUserPassword = await hash(`${labUserName}password`, 14);

      const labTeamUser = await userRepository.create({
        userName: labUserName,
        password: labUserPassword,
        firstName: labUserName,
        lastName: null,
        role: UserRole.USER,
        team: UserTeam.LAB
      });

      const productionUserName = `production${index}`;
      const productionUserPassword = await hash(`${productionUserName}password`, 14);

      const productionTeamUser = await userRepository.create({
        userName: productionUserName,
        password: productionUserPassword,
        firstName: productionUserName,
        lastName: null,
        role: UserRole.USER,
        team: UserTeam.PRODUCTION
      });

      seedUsers = [
        ...seedUsers,
        adminTeamUser,
        swabTeamUser,
        labTeamUser,
        productionTeamUser
      ];
    }

    await userRepository.upsert(seedUsers, ['userName']);
  }
}