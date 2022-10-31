import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

export default class SwabPeriodSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const swabPeriodRepository = dataSource.getRepository(SwabPeriod);

    let swabPeriods = [
      {
        swabPeriodName: 'ก่อน Super Big Cleaning',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'หลัง Super Big Cleaning',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'หลังประกอบเครื่อง',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'ก่อนล้างระหว่างงาน',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'หลังล้างระหว่างงาน',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'ก่อนล้างท้ายกะ',
        dependsOnShift: true,
      },
      {
        swabPeriodName: 'หลังล้างท้ายกะ',
        dependsOnShift: true,
      },
    ];

    await swabPeriodRepository.upsert(swabPeriods, ['swabPeriodName']);
  }
}
