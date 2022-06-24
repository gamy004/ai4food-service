import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { UserFactory } from '~/factories/user.factory';
import { User, UserRole } from '~/user/entities/user.entity';

export class UserSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    const userFactory = new UserFactory(em);

    // const userRepo = em.getRepository(User);

    for (let index = 1; index <= 5; index++) {
      await userFactory.create(5, {
        userName: `admin${index}`,
        role: UserRole.ADMIN
      });

      await userFactory.create(5, {
        userName: `user${index}`,
        role: UserRole.USER
      });
    }
  }

}
