import { v4 } from "uuid";
import { User } from '~/user/entities/user.entity';

import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(User, (faker) => {
    const user = new User();

    user.id = v4();
    user.userName = faker.internet.userName();
    user.password = faker.internet.password();
    user.firstName = faker.name.firstName();
    user.lastName = faker.name.lastName();
    user.email = faker.internet.email(user.firstName, user.lastName);

    return user;
})