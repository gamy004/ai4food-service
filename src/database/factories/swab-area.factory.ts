import { setSeederFactory } from 'typeorm-extension';
import { SwabArea } from "~/swab/entities/swab-area.entity";

export default setSeederFactory(SwabArea, (faker) => {
    const swabArea = new SwabArea();

    swabArea.swabAreaName = faker.word.noun();

    return swabArea;
})