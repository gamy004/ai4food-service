import { setSeederFactory } from 'typeorm-extension';
import { SwabTest } from "~/swab/entities/swab-test.entity";

export default setSeederFactory(SwabTest, (faker) => {
    const swabTest = new SwabTest();

    swabTest.swabTestCode = faker.random.alphaNumeric(5);

    return swabTest;
})