import { v4 } from "uuid";
import { format } from "date-fns";
import { setSeederFactory } from 'typeorm-extension';
import { ProductSchedule } from '~/product-schedule/entities/product-schedule.entity';

export default setSeederFactory(ProductSchedule, (faker) => {
    const productSchedule = new ProductSchedule();

    productSchedule.id = v4();
    productSchedule.productScheduleAmount = faker.datatype.number({ min: 1000, max: 2000 });

    const date = faker.date.recent();

    productSchedule.productScheduleDate = date;
    productSchedule.productScheduleEndedAt = format(date, "HH:mm");
    productSchedule.productScheduleStartedAt = format(
        new Date(
            new Date(
                productSchedule.productScheduleEndedAt
            ).setHours(date.getHours() - 1)
        )
        , "HH:mm"); // end date was set as start date plus 1 hour ahead

    return productSchedule;
})