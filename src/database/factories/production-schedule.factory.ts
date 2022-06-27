import { setSeederFactory } from 'typeorm-extension';
import { Product } from '~/product/entities/product.entity';
import { ProductSchedule } from '~/product-schedule/entities/product-schedule.entity';

export default setSeederFactory(ProductSchedule, (faker) => {
    const productSchedule = new ProductSchedule();

    productSchedule.productScheduleAmount = faker.datatype.number({ min: 1000, max: 2000 });

    productSchedule.productScheduleDate = faker.date.recent();
    productSchedule.productScheduleEndedAt = productSchedule.productScheduleDate;
    productSchedule.productScheduleStartedAt = new Date(
        new Date(
            productSchedule.productScheduleEndedAt
        ).setHours(productSchedule.productScheduleEndedAt.getHours() - 1)
    ); // end date was set as start date plus 1 hour ahead

    return productSchedule;
})