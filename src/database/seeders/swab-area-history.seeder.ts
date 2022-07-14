import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabAreaHistory } from '~/swab/entities/swab-area-history.entity';
import { SwabTest } from '~/swab/entities/swab-test.entity';

export default class ProductScheduleSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const swabAreaHistoryRepository = dataSource.getRepository(SwabAreaHistory);

        // // // ---------------------------------------------------

        const swabAreaHistoryFactory = await factoryManager.get(SwabAreaHistory);
        const swabTestFactory = await factoryManager.get(SwabTest);

        let swabAreaHistories = [];

        for (let index = 0; index <= 9; index++) {
            const currentDate = new Date();

            currentDate.setDate(currentDate.getDate() + index);

            for (let index2 = 0; index2 < 10; index2++) {
                const swabTest = await swabTestFactory.make({
                    listeriaMonoDetected: null,
                    listeriaMonoValue: null
                });

                const swabAreaHistory = await swabAreaHistoryFactory.make({
                    swabAreaDate: currentDate,
                    swabAreaSwabedAt: null,
                    swabTest
                });

                swabAreaHistories.push(swabAreaHistory);
            }
        }

        await swabAreaHistoryRepository.save(swabAreaHistories);
    }
}