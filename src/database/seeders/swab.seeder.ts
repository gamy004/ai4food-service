import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { Facility } from '~/facility/entities/facility.entity';

export default class SwabSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const swapAreas = [
      {
        facilityName: 'ขึ้นรูป',
        mainSwabAreas: [
          {
            swabAreaName:
              'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter', // not collected
            subSwabAreas: [
              { swabAreaName: 'ชุดเติมข้าว', contactZoneName: 'Zone 1' },
              { swabAreaName: 'สายพานลำเลียง', contactZoneName: 'Zone 1' },
              { swabAreaName: 'แกนซุย', contactZoneName: 'Zone 1' },
              { swabAreaName: 'ชุด Hopper', contactZoneName: 'Zone 1' },
              { swabAreaName: 'Shutter', contactZoneName: 'Zone 1' },
            ],
          },
          {
            swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
            subSwabAreas: [
              {
                swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight',
                contactZoneName: 'Zone 1',
              },
              { swabAreaName: 'แขนชัตเตอร์', contactZoneName: 'Zone 1' },
            ],
          },
          {
            swabAreaName:
              'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
            subSwabAreas: [
              { swabAreaName: 'ชุดกดหน้าข้าว', contactZoneName: 'Zone 1' },
              {
                swabAreaName: 'ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                contactZoneName: 'Zone 1',
              },
            ],
          },
          {
            contactZoneName: 'Zone 1',
            swabAreaName: 'ถาดรองเศษใต้ Portion',
            subSwabAreas: [],
          },
          {
            swabAreaName:
              'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
            subSwabAreas: [
              {
                swabAreaName: 'คานตู้ control หน้าเครื่อง Portion',
                contactZoneName: 'Zone 1',
              },
              {
                swabAreaName: 'Cover ด้านบนเครื่อง',
                contactZoneName: 'Zone 1',
              },
              {
                swabAreaName: 'ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                contactZoneName: 'Zone 1',
              },
            ],
          },
          {
            swabAreaName:
              'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
            subSwabAreas: [
              {
                swabAreaName: 'โครงชุดเติมข้าว ส่วน Sup Weight',
                contactZoneName: 'Zone 1',
              },
              {
                swabAreaName: 'แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight',
                contactZoneName: 'Zone 1',
              },
              { swabAreaName: 'โครงชุดแขนชัตเตอร์', contactZoneName: 'Zone 1' },
            ],
          },
          {
            contactZoneName: 'Zone 1',
            swabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง',
            subSwabAreas: [],
          },
          {
            swabAreaName:
              'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
            subSwabAreas: [
              {
                swabAreaName: 'Cover หน้าเครื่องจุดวางถาด',
                contactZoneName: 'Zone 1',
              },
              {
                swabAreaName: 'ชุดกันรอบสายพานลำเลียงถาด',
                contactZoneName: 'Zone 1',
              },
            ],
          },
          {
            swabAreaName:
              'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
            subSwabAreas: [
              {
                swabAreaName: 'ช่องยกคานลิฟท์ด้านหลัง',
                contactZoneName: 'Zone 1',
              },
              { swabAreaName: 'ใต้ฐานลิฟท์ยกข้าว', contactZoneName: 'Zone 1' },
              { swabAreaName: 'แขนชุดลิฟท์ยกข้าว', contactZoneName: 'Zone 1' },
            ],
          },
          {
            swabAreaName: 'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
            subSwabAreas: [
              { swabAreaName: 'Cover ใส', contactZoneName: 'Zone 1' },
              { swabAreaName: 'Cover สแตนเลส', contactZoneName: 'Zone 1' },
              { swabAreaName: 'Slope ท้ายเครื่อง', contactZoneName: 'Zone 1' },
            ],
          },
          {
            contactZoneName: 'Zone 2',
            swabAreaName: 'สายพานลำเลียงถาด',
            subSwabAreas: [
              { swabAreaName: 'ตัวแผ่น', contactZoneName: 'Zone 2' },
              { swabAreaName: 'ตัวกั้น', contactZoneName: 'Zone 2' },
            ],
          },
          {
            swabAreaName: 'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
            subSwabAreas: [
              { swabAreaName: 'เลื่อนสายพาน', contactZoneName: 'Zone 3' },
              {
                swabAreaName: 'รอยต่อโครงสร้างด้านใต้สายพาน',
                contactZoneName: 'Zone 3',
              },
            ],
          },
          {
            contactZoneName: 'Zone 1',
            swabAreaName: 'ช่องใต้เฟรมสายพาน',
            subSwabAreas: [],
          },
          {
            swabAreaName:
              'ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control',
            subSwabAreas: [
              { swabAreaName: 'ขาตั้งเครื่อง', contactZoneName: 'Zone 3' },
              {
                swabAreaName: 'ใต้ฐานขาตั้งเครื่อง',
                contactZoneName: 'Zone 3',
              },
              {
                swabAreaName: 'ช่องข้างขาตั้งชุด Control',
                contactZoneName: 'Zone 3',
              },
            ],
          },
          {
            swabAreaName: 'ด้านบนตู้ Control Infeed และ สายไฟ',
            subSwabAreas: [
              {
                swabAreaName: 'ด้านบนตู้ Control Infeed',
                contactZoneName: 'Zone 3',
              },
              { swabAreaName: 'สายไฟ', contactZoneName: 'Zone 3' },
            ],
          },
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'พื้นใต้เครื่อง Portion',
            subSwabAreas: [],
          },
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'พื้นห้อง',
            subSwabAreas: [],
          },
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'ผนังห้อง',
            subSwabAreas: [],
          },
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'รางระบายน้ำห้อง',
            subSwabAreas: [
              { swabAreaName: 'กลางราง', contactZoneName: 'Zone 3' },
              { swabAreaName: 'ขอบรางซ้าย', contactZoneName: 'Zone 3' },
              { swabAreaName: 'ขอบรางขวา', contactZoneName: 'Zone 3' },
              { swabAreaName: 'Main Hole', contactZoneName: 'Zone 3' },
            ],
          },
          {
            swabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ',
            subSwabAreas: [
              { swabAreaName: 'แป้นกดสบู่', contactZoneName: 'Zone 2' },
              { swabAreaName: 'อ่างล้างมือ', contactZoneName: 'Zone 3' },
            ],
          },
          {
            contactZoneName: 'Zone 1',
            swabAreaName: 'มือพนักงานช่างประกอบเครื่องหลังล้าง',
            subSwabAreas: [],
          },
          {
            contactZoneName: 'Zone 2',
            swabAreaName: 'สายลมเครื่อง Portion',
            subSwabAreas: [],
          },
          {
            contactZoneName: 'Zone 2',
            swabAreaName: 'เครื่องชั่ง Topping',
            subSwabAreas: [],
          },
        ],
      },
      {
        facilityName: 'ตู้ Vac.',
        mainSwabAreas: [
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'พื้นและ Slope',
            subSwabAreas: [{ swabAreaName: 'พื้น' }, { swabAreaName: 'Slope' }],
          },
        ],
      },
      {
        facilityName: 'ตู้ Steam',
        mainSwabAreas: [
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'พื้นและ Slope',
            subSwabAreas: [{ swabAreaName: 'พื้น' }, { swabAreaName: 'Slope' }],
          },
        ],
      },
      {
        facilityName: 'กล่องเครื่องมือวิศวะ',
        mainSwabAreas: [
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'กล่องเครื่องมือวิศวะ',
            subSwabAreas: [
              { swabAreaName: 'ฝากล่อง' },
              { swabAreaName: 'ขอบมุม' },
              { swabAreaName: 'ประแจ' },
            ],
          },
        ],
      },
      {
        facilityName: 'รถเข็นกะบะ',
        mainSwabAreas: [
          {
            contactZoneName: 'Zone 3',
            swabAreaName: 'ล้อรถเข็นกะบะ',
            subSwabAreas: [
              { swabAreaName: 'กันชน' },
              { swabAreaName: 'ระหว่างรอยต่อ' },
              { swabAreaName: 'โครงล้อ' },
            ],
          },
        ],
      },
      {
        facilityName: 'เครื่องซุยข้าว Aiho No.2',
        mainSwabAreas: [
          {
            contactZoneName: 'Zone 1',
            swabAreaName: 'แกนสายพานซุยข้าว',
            subSwabAreas: [
              { swabAreaName: 'แกนกลาง' },
              { swabAreaName: 'ก้านซุย' },
            ],
          },
          {
            contactZoneName: 'Zone 1',
            swabAreaName: 'สายพานและแผ่นเพลท',
            subSwabAreas: [
              { swabAreaName: 'สายพาน - กลาง' },
              { swabAreaName: 'สายพาน - ขอบซ้าย' },
              { swabAreaName: 'สายพาน - ขอบขวา' },
              { swabAreaName: 'แผ่นเพลท' },
            ],
          },
        ],
      },
    ];

    // const swabAreaHistoryRepository = dataSource.getRepository(SwabAreaHistory);
    const swabAreaRepository = dataSource.getRepository(SwabArea);
    const facilityRepository = dataSource.getRepository(Facility);
    // const swabAreaHistoryFactory = await factoryManager.get(SwabAreaHistory);
    // const swabTestFactory = await factoryManager.get(SwabTest);

    // const swabAreaHistories = [];

    for (let index = 0; index < swapAreas.length; index++) {
      const { facilityName, mainSwabAreas = [] } = swapAreas[index];

      if (mainSwabAreas.length) {
        const facility = await facilityRepository.findOneBy({ facilityName });

        const savedMainSwabAreas = mainSwabAreas.map((mainSwabArea) => {
          let { subSwabAreas = [], swabAreaName } = mainSwabArea;

          return {
            swabAreaName,
            facility,
            subSwabAreas: subSwabAreas.map((subSwabArea) => {
              return {
                ...subSwabArea,
                facility,
              };
            }),
          };
        });

        await swabAreaRepository.save(savedMainSwabAreas);
      }
    }
  }
}
