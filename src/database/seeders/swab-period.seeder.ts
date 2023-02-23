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
        cleaningValidations: [
          {
            cleaningValidationName: 'เคลียร์เศษอาหารหมด',
          },
          {
            cleaningValidationName: 'ลงโฟมฆ่าเชื้อตามเวลาที่กำหนด',
          },
          {
            cleaningValidationName: 'ผ่าน steam ฆ่าเชือ',
          },
        ],
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
        cleaningValidations: [
          {
            cleaningValidationName: 'เคลียร์เศษอาหารหมด',
          },
          {
            cleaningValidationName: 'เช็ดแห้งสนิท',
          },
        ],
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
        cleaningValidations: [
          {
            cleaningValidationName: 'เคลียร์เศษอาหารหมด',
          },
          {
            cleaningValidationName: 'เช็ดแห้งสนิท',
          },
        ],
      },
    ];

    await swabPeriodRepository.upsert(swabPeriods, ['swabPeriodName']);
  }
}
