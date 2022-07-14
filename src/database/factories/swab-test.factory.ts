import { setSeederFactory } from 'typeorm-extension';
import { SwabTest } from "~/swab/entities/swab-test.entity";

export default setSeederFactory(SwabTest, (faker) => {
    const swabTest = new SwabTest();

    swabTest.listeriaMonoDetected = faker.datatype.boolean();
    swabTest.listeriaMonoValue = faker.datatype.number({ min: 10, max: 30 });

    return swabTest;
})