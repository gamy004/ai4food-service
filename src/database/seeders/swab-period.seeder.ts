import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';
// import { CleaningValidation } from '~/cleaning/entities/cleaning-validation.entity';

export default class SwabPeriodSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const swabPeriodRepository = dataSource.getRepository(SwabPeriod);
    // const cleaningValidationRepository =
    //   dataSource.getRepository(CleaningValidation);

    const swabPeriods = [
      {
        swabPeriodName: 'หลังประกอบเครื่อง',
        requiredValidateCleaning: false,
        swabPeriodOrder: 1,
      },
      {
        swabPeriodName: 'ก่อนล้างระหว่างงาน',
        requiredValidateCleaning: false,
        swabPeriodOrder: 2,
      },
      {
        swabPeriodName: 'หลังล้างระหว่างงาน',
        requiredValidateCleaning: true,
        swabPeriodOrder: 3,
        // cleaningValidations: [
        //   {
        //     cleaningValidationName: 'เคลียร์เศษอาหารหมด',
        //   },
        //   {
        //     cleaningValidationName: 'เช็ดแห้งสนิท',
        //   },
        // ],
      },
      {
        swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.',
        requiredValidateCleaning: false,
        swabPeriodOrder: 4,
      },
      {
        swabPeriodName: 'ก่อน Super Big Cleaning',
        requiredValidateCleaning: false,
        swabPeriodOrder: 5,
      },
      {
        swabPeriodName: 'หลัง Super Big Cleaning',
        requiredValidateCleaning: true,
        swabPeriodOrder: 6,
        // cleaningValidations: [
        //   {
        //     cleaningValidationName: 'เคลียร์เศษอาหารหมด',
        //   },
        //   {
        //     cleaningValidationName: 'ลงโฟมฆ่าเชื้อตามเวลาที่กำหนด',
        //   },
        //   {
        //     cleaningValidationName: 'ผ่าน steam ฆ่าเชือ',
        //   },
        // ],
      },
      {
        swabPeriodName: 'ก่อนล้างท้ายกะ',
        requiredValidateCleaning: false,
        swabPeriodOrder: 7,
      },
      {
        swabPeriodName: 'หลังล้างท้ายกะ',
        requiredValidateCleaning: true,
        swabPeriodOrder: 8,
        // cleaningValidations: [
        //   {
        //     cleaningValidationName: 'เคลียร์เศษอาหารหมด',
        //   },
        //   {
        //     cleaningValidationName: 'เช็ดแห้งสนิท',
        //   },
        // ],
      },
    ];

    for (let index = 0; index < swabPeriods.length; index++) {
      const props = swabPeriods[index];

      const swabPeriod = swabPeriodRepository.create(props);

      const existSwabPeriod = await swabPeriodRepository.findOneBy({
        swabPeriodName: swabPeriod.swabPeriodName,
      });

      if (existSwabPeriod) {
        swabPeriod.id = existSwabPeriod.id;
      }

      // if (swabPeriod.requiredValidateCleaning && cleaningValidations.length) {
      //   const upsertCleaningValidations = [];

      //   for (
      //     let cleaningValidationIndex = 0;
      //     cleaningValidationIndex < cleaningValidations.length;
      //     cleaningValidationIndex++
      //   ) {
      //     const { cleaningValidationName } =
      //       cleaningValidations[cleaningValidationIndex];

      //     let cleaningValidation = cleaningValidationRepository.create({
      //       cleaningValidationName,
      //     });

      //     const existCleaningValidation =
      //       await cleaningValidationRepository.findOneBy({
      //         cleaningValidationName,
      //       });

      //     if (existCleaningValidation) {
      //       cleaningValidation.id = existCleaningValidation.id;
      //     }

      //     upsertCleaningValidations.push(cleaningValidation);
      //   }

      //   swabPeriod.cleaningValidations = [...upsertCleaningValidations];
      // }

      await swabPeriodRepository.save(swabPeriod);
    }
  }
}
