import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';
import { CleaningValidation } from '~/cleaning/entities/cleaning-validation.entity';

export default class CleaningValidationSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const swabPeriodRepository = dataSource.getRepository(SwabPeriod);
    const swabAreaRepository = dataSource.getRepository(SwabArea);
    const cleaningValidationRepository =
      dataSource.getRepository(CleaningValidation);

    let cleaningValidation = [
      {
        cleaningValidationName: 'Vip Klear',
        active: true,
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                mainSwabAreaNames: [
                  'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  'สายพานลำเลียงถาด',
                  'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  'ช่องใต้เฟรมสายพาน',
                  'ขาตั้งเครื่อง',
                  'ใต้ฐานขาตั้งเครื่อง',
                  'ช่องข้างขาตั้งชุด Control',
                  'ด้านบนตู้ Control Infeed',
                  'สายไฟ',
                  'พื้นใต้เครื่อง Portion',
                  'สายลมเครื่อง Portion',
                  'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                  'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                ],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'ล้างน้ำ',
        active: true,
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                mainSwabAreaNames: [
                  'ถาดรองเศษใต้ Portion',
                  'แป้นกดสบู่ และ อ่างล้างมือ',
                  'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                ],
              },
              {
                facilityName: 'ตู้ Steam',
                mainSwabAreaNames: ['พื้นและ Slope'],
              },
            ],
          },
        ],
      },
    ];
  }
}
