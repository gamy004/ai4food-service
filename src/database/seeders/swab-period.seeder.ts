import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

export default class SwabPeriodSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const swabPeriodRepository = dataSource.getRepository(SwabPeriod);

        let swabPeriods = [
            {
                swabPeriodName: "ก่อน Super Big Cleaning",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "หลัง Super Big Cleaning",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "หลังประกอบเครื่อง",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "ก่อนล้างระหว่างงาน",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "หลังล้างระหว่างงาน",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "เดินไลน์หลังพัก 4 ชม.",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "ก่อนล้างท้ายกะ",
                swabPeriodType: ""
            },
            {
                swabPeriodName: "หลังล้างท้ายกะ",
                swabPeriodType: ""
            },

        ];

        await swabPeriodRepository.upsert(swabPeriods, ['swabPeriodName', 'swabPeriodType']);
    }
}