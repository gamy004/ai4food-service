import { v4 } from "uuid";
import { setSeederFactory } from 'typeorm-extension';
import { SwabAreaHistory } from "~/swab/entities/swab-area-history.entity";

export default setSeederFactory(SwabAreaHistory, (faker) => {
    const swabAreaHistory = new SwabAreaHistory();
    const swabDate = faker.date.recent();

    swabAreaHistory.id = v4();
    swabAreaHistory.swabAreaDate = swabDate;
    swabAreaHistory.swabAreaSwabedAt = swabDate;
    swabAreaHistory.swabAreaTemperature = faker.datatype.number({ min: 10, max: 30 });
    swabAreaHistory.swabAreaHumidity = faker.datatype.number({ min: 40, max: 70 });
    swabAreaHistory.swabAreaAtp = faker.datatype.number({ min: 10, max: 200 });

    return swabAreaHistory;
})