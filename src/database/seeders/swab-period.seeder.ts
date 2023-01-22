import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

export default class SwabPeriodSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const swabPeriodRepository = dataSource.getRepository(SwabPeriod);

    let swabPeriods = [
      {
        swabPeriodName: 'ก่อน Super Big Cleaning',
        requiredValidateCleaning: false,
      },
      {
        swabPeriodName: 'หลัง Super Big Cleaning',
        requiredValidateCleaning: true,
      },
      {
        swabPeriodName: 'หลังประกอบเครื่อง',
        requiredValidateCleaning: false,
      },
      {
        swabPeriodName: 'ก่อนล้างระหว่างงาน',
        requiredValidateCleaning: false,
      },
      {
        swabPeriodName: 'หลังล้างระหว่างงาน',
        requiredValidateCleaning: true,
      },
      {
        swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.',
        requiredValidateCleaning: false,
      },
      {
        swabPeriodName: 'ก่อนล้างท้ายกะ',
        requiredValidateCleaning: false,
      },
      {
        swabPeriodName: 'หลังล้างท้ายกะ',
        requiredValidateCleaning: true,
      },
    ];

    await swabPeriodRepository.upsert(swabPeriods, ['swabPeriodName']);
  }
}
