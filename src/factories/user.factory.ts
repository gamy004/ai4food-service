import { Factory, Faker } from '@mikro-orm/seeder';
import { User } from '~/user/entities/user.entity';

export class UserFactory extends Factory<User> {
    model = User;

    definition(faker: Faker): Partial<User> {
        return {
            userName: faker.internet.userName(),
            firstName: faker.name.findName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };
    }
}