import { Seeder } from 'typeorm-extension';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User, UserRole, UserTeam } from '~/auth/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // ---------------------------------------------------

    // const userFactory = await factoryManager.get(User);

    let seedUsers = [
      {
        userName: 'admin1',
        firstName: 'admin1',
        lastName: null,
        role: UserRole.ADMIN,
        team: UserTeam.ADMIN,
      },
      {
        userName: 'swab1',
        firstName: 'swab1',
        lastName: null,
        role: UserRole.USER,
        team: UserTeam.SWAB,
      },
      {
        userName: 'lab1',
        firstName: 'lab1',
        lastName: null,
        role: UserRole.USER,
        team: UserTeam.LAB,
      },
      {
        userName: 'production1',
        firstName: 'production1',
        lastName: null,
        role: UserRole.USER,
        team: UserTeam.PRODUCTION,
      },
    ];

    for (let index = 0; index < seedUsers.length; index++) {
      const { userName, firstName, lastName, role, team } = seedUsers[index];

      const user = await userRepository.findOneBy({ userName });

      if (!user) {
        const password = await hash(`${userName}password`, 14);

        const userEntity = userRepository.create({
          userName,
          password,
          firstName,
          lastName,
          role,
          team,
        });

        await userRepository.save(userEntity);
      }
    }
  }
}
