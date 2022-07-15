import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabAreaHistory } from '~/swab/entities/swab-area-history.entity';
import { SwabTest } from '~/swab/entities/swab-test.entity';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { Facility, FacilityType } from '~/facility/entities/facility.entity';

export default class SwabAreaHistorySeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // const swabAreaHistoryRepository = dataSource.getRepository(SwabAreaHistory);

        // // // // ---------------------------------------------------
        // const facilityFactory = await factoryManager.get(Facility);
        // const swabAreaHistoryFactory = await factoryManager.get(SwabAreaHistory);
        // const swabTestFactory = await factoryManager.get(SwabTest);
        // const swabAreaFactory = await factoryManager.get(SwabArea);

        // let swabAreaHistories = [];

        // for (let areaIndex = 1; areaIndex <= 5; areaIndex++) {
        //     const mainSwabArea = await swabAreaFactory.save({
        //         swabAreaName: `main swab area ${areaIndex}`
        //     });

        //     const subSwabAreas = await swabAreaFactory.saveMany(5, {
        //         mainSwabArea
        //     });

        //     subSwabAreas.forEach(async (subSwabArea) => {
        //         for (let index = 0; index <= 9; index++) {
        //             const currentDate = new Date();

        //             currentDate.setDate(currentDate.getDate() + index);

        //             for (let index2 = 0; index2 < 10; index2++) {
        //                 const swabTest = await swabTestFactory.make({
        //                     listeriaMonoDetected: null,
        //                     listeriaMonoValue: null
        //                 });

        //                 const swabAreaHistory = await swabAreaHistoryFactory.make({
        //                     swabAreaDate: currentDate,
        //                     swabAreaSwabedAt: null,
        //                     swabTest,
        //                     swabArea: subSwabArea
        //                 });

        //                 swabAreaHistories.push(swabAreaHistory);
        //             }
        //         }
        //     });
        // }

        // await swabAreaHistoryRepository.save(swabAreaHistories);
    }
}