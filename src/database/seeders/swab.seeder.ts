import { Seeder } from 'typeorm-extension';
import { DataSource, IsNull } from 'typeorm';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { Facility } from '~/facility/entities/facility.entity';
import { ContactZone } from '~/facility/entities/contact-zone.entity';

export default class SwabSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const swapAreas = [
      // {
      //   facilityName: 'ขึ้นรูป',
      //   mainSwabAreas: [
      //     {
      //       swabAreaName:
      //         'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter', // not collected
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'ชุดเติมข้าว', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'สายพานลำเลียง', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'แกนซุย', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'ชุด Hopper', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'Shutter', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         {
      //           swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight',
      //           contactZoneName: 'Zone 1',
      //         },
      //         { swabAreaName: 'แขนชัตเตอร์', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //     {
      //       swabAreaName:
      //         'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'ชุดกดหน้าข้าว', contactZoneName: 'Zone 1' },
      //         {
      //           swabAreaName: 'ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
      //           contactZoneName: 'Zone 1',
      //         },
      //       ],
      //     },
      //     {
      //       contactZoneName: 'Zone 1',
      //       swabAreaName: 'ถาดรองเศษใต้ Portion',
      //       subSwabAreas: [],
      //     },
      //     {
      //       swabAreaName:
      //         'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         {
      //           swabAreaName: 'คานตู้ control หน้าเครื่อง Portion',
      //           contactZoneName: 'Zone 1',
      //         },
      //         {
      //           swabAreaName: 'Cover ด้านบนเครื่อง',
      //           contactZoneName: 'Zone 1',
      //         },
      //         {
      //           swabAreaName: 'ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
      //           contactZoneName: 'Zone 1',
      //         },
      //       ],
      //     },
      //     {
      //       swabAreaName:
      //         'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         {
      //           swabAreaName: 'โครงชุดเติมข้าว ส่วน Sup Weight',
      //           contactZoneName: 'Zone 1',
      //         },
      //         {
      //           swabAreaName: 'แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight',
      //           contactZoneName: 'Zone 1',
      //         },
      //         { swabAreaName: 'โครงชุดแขนชัตเตอร์', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //     {
      //       contactZoneName: 'Zone 1',
      //       swabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง',
      //       subSwabAreas: [],
      //     },
      //     {
      //       swabAreaName:
      //         'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         {
      //           swabAreaName: 'Cover หน้าเครื่องจุดวางถาด',
      //           contactZoneName: 'Zone 1',
      //         },
      //         {
      //           swabAreaName: 'ชุดกันรอบสายพานลำเลียงถาด',
      //           contactZoneName: 'Zone 1',
      //         },
      //       ],
      //     },
      //     {
      //       swabAreaName:
      //         'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         {
      //           swabAreaName: 'ช่องยกคานลิฟท์ด้านหลัง',
      //           contactZoneName: 'Zone 1',
      //         },
      //         { swabAreaName: 'ใต้ฐานลิฟท์ยกข้าว', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'แขนชุดลิฟท์ยกข้าว', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'Cover ใส', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'Cover สแตนเลส', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'Slope ท้ายเครื่อง', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'สายพานลำเลียงถาด', // ไม่มีรข้อมูลใน excel confirm อีกที!!
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'ตัวแผ่น', contactZoneName: 'Zone 2' },
      //         { swabAreaName: 'ตัวกั้น', contactZoneName: 'Zone 2' },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน', // ไม่มีรข้อมูลใน excel confirm อีกที!!
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'เลื่อนสายพาน', contactZoneName: 'Zone 3' },
      //         {
      //           swabAreaName: 'รอยต่อโครงสร้างด้านใต้สายพาน',
      //           contactZoneName: 'Zone 3',
      //         },
      //       ],
      //     },
      //     {
      //       contactZoneName: 'Zone 1',
      //       swabAreaName: 'ช่องใต้เฟรมสายพาน',
      //       subSwabAreas: [],
      //     },
      //     {
      //       swabAreaName:
      //         'ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'ขาตั้งเครื่อง', contactZoneName: 'Zone 3' },
      //         {
      //           swabAreaName: 'ใต้ฐานขาตั้งเครื่อง',
      //           contactZoneName: 'Zone 3',
      //         },
      //         {
      //           swabAreaName: 'ช่องข้างขาตั้งชุด Control',
      //           contactZoneName: 'Zone 3',
      //         },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'ด้านบนตู้ Control Infeed และ สายไฟ',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         {
      //           swabAreaName: 'ด้านบนตู้ Control Infeed',
      //           contactZoneName: 'Zone 3',
      //         },
      //         { swabAreaName: 'สายไฟ', contactZoneName: 'Zone 3' },
      //       ],
      //     },
      //     {
      //       contactZoneName: 'Zone 3',
      //       swabAreaName: 'พื้นใต้เครื่อง Portion',
      //       subSwabAreas: [],
      //     },
      //     {
      //       contactZoneName: 'Zone 3',
      //       swabAreaName: 'พื้นห้อง',
      //       subSwabAreas: [],
      //     },
      //     {
      //       contactZoneName: 'Zone 3',
      //       swabAreaName: 'ผนังห้อง',
      //       subSwabAreas: [],
      //     },
      //     {
      //       swabAreaName: 'รางระบายน้ำห้อง',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'กลางราง', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'ขอบรางซ้าย', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'ขอบรางขวา', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'Main Hole', contactZoneName: 'Zone 3' },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'แป้นกดสบู่', contactZoneName: 'Zone 2' },
      //         { swabAreaName: 'อ่างล้างมือ', contactZoneName: 'Zone 3' },
      //       ],
      //     },
      //     {
      //       contactZoneName: 'Zone 1',
      //       swabAreaName: 'มือพนักงานช่างประกอบเครื่องหลังล้าง',
      //       subSwabAreas: [],
      //     },
      //     {
      //       contactZoneName: 'Zone 2',
      //       swabAreaName: 'สายลมเครื่อง Portion',
      //       subSwabAreas: [],
      //     },
      //     {
      //       contactZoneName: 'Zone 2',
      //       swabAreaName: 'เครื่องชั่ง Topping',
      //       subSwabAreas: [],
      //     },
      //   ],
      // },
      // {
      //   facilityName: 'ตู้ Vac.',
      //   mainSwabAreas: [
      //     {
      //       swabAreaName: 'พื้นและ Slope',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'พื้น', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'Slope', contactZoneName: 'Zone 3' },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   facilityName: 'ตู้ Steam',
      //   mainSwabAreas: [
      //     {
      //       swabAreaName: 'พื้นและ Slope',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'พื้น', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'Slope', contactZoneName: 'Zone 3' },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   facilityName: 'กล่องเครื่องมือวิศวะ',
      //   mainSwabAreas: [
      //     {
      //       swabAreaName: 'กล่องเครื่องมือวิศวะ',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'ฝากล่อง', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'ขอบมุม', contactZoneName: 'Zone 3' },
      //         { swabAreaName: 'ประแจ', contactZoneName: 'Zone 3' },
      //       ],
      //     },
      //   ],
      // },
      {
        facilityName: 'รถเข็นกะบะ',
        mainSwabAreas: [
          {
            swabAreaName: 'ล้อรถเข็นกะบะ',
            contactZoneName: null,
            subSwabAreas: [
              { swabAreaName: 'กันชน', contactZoneName: 'Zone 3' },
              { swabAreaName: 'ระหว่างรอยต่อ', contactZoneName: 'Zone 3' },
              { swabAreaName: 'โครงล้อ', contactZoneName: 'Zone 3' },
            ],
          },
        ],
      },
      // {
      //   facilityName: 'เครื่องซุยข้าว Aiho',
      //   mainSwabAreas: [
      //     {
      //       swabAreaName: 'แกนสายพานซุยข้าว',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'แกนกลาง', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'ก้านซุย', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //     {
      //       swabAreaName: 'สายพานและแผ่นเพลท',
      //       contactZoneName: null,
      //       subSwabAreas: [
      //         { swabAreaName: 'สายพาน - กลาง', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'สายพาน - ขอบซ้าย', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'สายพาน - ขอบขวา', contactZoneName: 'Zone 1' },
      //         { swabAreaName: 'แผ่นเพลท', contactZoneName: 'Zone 1' },
      //       ],
      //     },
      //   ],
      // },
    ];

    // const swabAreaHistoryRepository = dataSource.getRepository(SwabAreaHistory);
    const swabAreaRepository = dataSource.getRepository(SwabArea);
    const facilityRepository = dataSource.getRepository(Facility);
    const contactZoneRepository = dataSource.getRepository(ContactZone);
    // const swabAreaHistoryFactory = await factoryManager.get(SwabAreaHistory);
    // const swabTestFactory = await factoryManager.get(SwabTest);

    // const swabAreaHistories = [];
    const contactZones = await contactZoneRepository.findBy([
      { contactZoneName: 'Zone 1' },
      { contactZoneName: 'Zone 2' },
      { contactZoneName: 'Zone 3' },
    ]);

    const contactZoneMapping = contactZones.reduce((mapping, contactZone) => {
      mapping[contactZone.contactZoneName] = contactZone;

      return mapping;
    }, {});

    const savedMainSwabAreas = [];

    for (let index = 0; index < swapAreas.length; index++) {
      const { facilityName, mainSwabAreas = [] } = swapAreas[index];

      if (mainSwabAreas.length) {
        const facility = await facilityRepository.findOneBy({ facilityName });

        for (let index = 0; index < mainSwabAreas.length; index++) {
          const mainSwabAreaData = mainSwabAreas[index];

          let {
            subSwabAreas = [],
            swabAreaName,
            contactZoneName,
          } = mainSwabAreaData;

          const savedMainSwabAreaEntity = swabAreaRepository.create({
            swabAreaName,
            facility,
            contactZone: null,
            subSwabAreas: [],
          });

          if (contactZoneName && contactZoneMapping[contactZoneName]) {
            savedMainSwabAreaEntity.contactZone =
              contactZoneMapping[contactZoneName];
          }

          let existMainSwabArea = await swabAreaRepository.findOneBy({
            swabAreaName,
            facilityId: facility.id,
            mainSwabAreaId: IsNull(),
          });

          console.log('existMainSwabArea', existMainSwabArea);

          if (existMainSwabArea) {
            savedMainSwabAreaEntity.id = existMainSwabArea.id;
          }

          console.log('savedMainSwabAreaEntity', savedMainSwabAreaEntity);

          if (subSwabAreas.length) {
            for (let index2 = 0; index2 < subSwabAreas.length; index2++) {
              const subSwabAreaData = subSwabAreas[index2];

              let {
                swabAreaName: subSwabAreaName,
                contactZoneName: subContactZoneName,
              } = subSwabAreaData;

              if (!subContactZoneName) {
                throw new Error(
                  'Sub swab area require `contactZoneName` attibute',
                );
              }

              const savedSubSwabAreaEntity = swabAreaRepository.create({
                swabAreaName: subSwabAreaName,
                facility,
                contactZone: contactZoneMapping[subContactZoneName],
              });

              if (existMainSwabArea) {
                let existSubSwabArea = await swabAreaRepository.findOneBy({
                  swabAreaName: subSwabAreaName,
                  facilityId: facility.id,
                  mainSwabAreaId: existMainSwabArea.id,
                });

                console.log('existSubSwabArea', existSubSwabArea);

                if (existSubSwabArea) {
                  savedSubSwabAreaEntity.id = existSubSwabArea.id;
                }
              }

              console.log('savedSubSwabAreaEntity', savedSubSwabAreaEntity);

              savedMainSwabAreaEntity.subSwabAreas.push(savedSubSwabAreaEntity);
            }
          }
          savedMainSwabAreas.push(savedMainSwabAreaEntity);
        }
      }
    }

    await swabAreaRepository.save(savedMainSwabAreas);
  }
}
