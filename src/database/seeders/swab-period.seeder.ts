import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

export default class SwabPeriodSeeder implements Seeder {
  public async run(
    dataSource: DataSource
  ): Promise<any> {
    const swabPeriodRepository = dataSource.getRepository(SwabPeriod);

    let swabPeriods = [
      {
        swabPeriodName: 'ก่อน Super Big Cleaning',
      },
      {
        swabPeriodName: 'หลัง Super Big Cleaning',
      },
      {
        swabPeriodName: 'หลังประกอบเครื่อง',
      },
      {
        swabPeriodName: 'ก่อนล้างระหว่างงาน',
      },
      {
        swabPeriodName: 'หลังล้างระหว่างงาน',
      },
      {
        swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.',
      },
      {
        swabPeriodName: 'ก่อนล้างท้ายกะ',
      },
      {
        swabPeriodName: 'หลังล้างท้ายกะ',
      },
    ];

    await swabPeriodRepository.upsert(swabPeriods, ['swabPeriodName']);
  }
}
