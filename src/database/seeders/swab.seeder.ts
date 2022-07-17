import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabAreaHistory } from '~/swab/entities/swab-area-history.entity';
import { SwabTest } from '~/swab/entities/swab-test.entity';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

const NUMBER_OF_HISTORY_DAY = 3;

export default class SwabSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const swabPeriodRepository = dataSource.getRepository(SwabPeriod);

        const bigCleaningSwabPeriods = await swabPeriodRepository.findBy([
            { swabPeriodName: "ก่อน Super Big Cleaning" },
            { swabPeriodName: "หลัง Super Big Cleaning" },
        ]);

        const generalSwabPeriods = await swabPeriodRepository.findBy([
            { swabPeriodName: "หลังประกอบเครื่อง" },
            { swabPeriodName: "ก่อนล้างระหว่างงาน" },
            { swabPeriodName: "หลังล้างระหว่างงาน" },
            { swabPeriodName: "เดินไลน์หลังพัก 4 ชม." },
            { swabPeriodName: "ก่อนล้างท้ายกะ" },
            { swabPeriodName: "หลังล้างท้ายกะ" },
        ]);

        const swapAreas = [
            {
                facilityItemName: "ไลน์4 ขึ้นรูป2",
                mainSwabAreas: [
                    {
                        swabAreaName: "ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter",
                        subSwabAreas: [
                            { swabAreaName: "ชุดเติมข้าว" },
                            { swabAreaName: "สายพานลำเลียง" },
                            { swabAreaName: "แกนซุย" },
                            { swabAreaName: "ชุด Hopper" },
                            { swabAreaName: "Shutter" },
                        ]
                    },
                    {
                        swabAreaName: "ถาดรองเศษใต้ Portion"
                    },
                    {
                        swabAreaName: "คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่องและช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว",
                        subSwabAreas: [
                            { swabAreaName: "คานตู้ control หน้าเครื่อง Portion" },
                            { swabAreaName: "Cover ด้านบนเครื่อง" },
                            { swabAreaName: "ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว" }
                        ]
                    },
                    {
                        swabAreaName: "โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และโครงชุดแขนชัตเตอร์",
                        subSwabAreas: [
                            { swabAreaName: "โครงชุดเติมข้าว ส่วน Sup Weight" },
                            { swabAreaName: "แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight" },
                            { swabAreaName: "โครงชุดแขนชัตเตอร์" }
                        ]
                    },
                    {
                        swabAreaName: "สายพานลำเลียงถาด",
                        subSwabAreas: [
                            { swabAreaName: "ตัวแผ่น" },
                            { swabAreaName: "ตัวกั้น" },
                        ]
                    },
                    {
                        swabAreaName: "รางสายไฟและรอยต่อโครงสร้างด้านใต้สายพาน",
                        subSwabAreas: [
                            { swabAreaName: "รางสายไฟ" },
                            { swabAreaName: "รอยต่อโครงสร้างด้านใต้สายพาน" },
                        ]
                    },
                    {
                        swabAreaName: "ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และช่องข้างขาตั้งชุด Control",
                        subSwabAreas: [
                            { swabAreaName: "ขาตั้งเครื่อง" },
                            { swabAreaName: "ใต้ฐานขาตั้งเครื่อง" },
                            { swabAreaName: "ช่องข้างขาตั้งชุด Control" },
                        ]
                    },
                    {
                        swabAreaName: "ด้านบนตู้ Control Infeed และสายไฟ",
                        subSwabAreas: [
                            { swabAreaName: "ด้านบนตู้ Control Infeed" },
                            { swabAreaName: "สายไฟ" },
                        ]
                    },
                    {
                        swabAreaName: "พื้นใต้เครื่อง Portion"
                    },
                    {
                        swabAreaName: "รางระบายน้ำห้อง Processing 2",
                        subSwabAreas: [
                            { swabAreaName: "กลางราง" },
                            { swabAreaName: "ขอบรางซ้าย" },
                            { swabAreaName: "ขอบรางขวา" },
                            { swabAreaName: "Main Hole" },
                        ]
                    },
                ]
            },
            {
                facilityItemName: "ตู้ Vac. โซนสุก No.1",
                mainSwabAreas: [
                    {
                        swabAreaName: "พื้นและ Slope",
                        subSwabAreas: [
                            { swabAreaName: "พื้น" },
                            { swabAreaName: "Slope" },
                        ]
                    },
                ]
            },
            {
                facilityItemName: "ตู้ Steam โซนสุก No.1",
                mainSwabAreas: [
                    {
                        swabAreaName: "พื้นและ Slope",
                        subSwabAreas: [
                            { swabAreaName: "พื้น" },
                            { swabAreaName: "Slope" },
                        ]
                    },
                ]
            },
            {
                facilityItemName: "กล่องเครื่องมือวิศวะ โซนสุก",
                mainSwabAreas: [
                    { swabAreaName: "ฝากล่อง" },
                    { swabAreaName: "ขอบมุม" },
                    { swabAreaName: "ประแจ" },
                ]
            },
            {
                facilityItemName: "รถเข็นกะบะ โซนสุก",
                mainSwabAreas: [
                    {
                        swabAreaName: "ล้อรถเข็นกะบะ",
                        subSwabAreas: [
                            { swabAreaName: "กันชน" },
                            { swabAreaName: "ระหว่างรอยต่อ" },
                            { swabAreaName: "โครงล้อ" },
                        ]
                    }
                ]
            },
            {
                facilityItemName: "เครื่องซุยข้าว Aiho No.2",
                mainSwabAreas: [
                    {
                        swabAreaName: "แกนสายพาน",
                        subSwabAreas: [
                            { swabAreaName: "แกนกลาง" },
                            { swabAreaName: "ก้านซุย" },
                        ]
                    },
                    {
                        swabAreaName: "สายพานและแผ่นเพลท",
                        subSwabAreas: [
                            { swabAreaName: "สายพาน - กลาง" },
                            { swabAreaName: "สายพาน - ขอบซ้าย" },
                            { swabAreaName: "สายพาน - ขอบขวา" },
                            { swabAreaName: "แผ่นเพลท" },
                        ]
                    },
                ]
            },
        ];

        const swabAreaHistoryRepository = dataSource.getRepository(SwabAreaHistory);
        const swabAreaRepository = dataSource.getRepository(SwabArea);
        const facilityItemRepository = dataSource.getRepository(FacilityItem);
        const swabAreaHistoryFactory = await factoryManager.get(SwabAreaHistory);
        const swabTestFactory = await factoryManager.get(SwabTest);

        const swabAreaHistories = [];

        for (let index = 0; index < swapAreas.length; index++) {
            const { facilityItemName, mainSwabAreas = [] } = swapAreas[index];

            const facilityItem = await facilityItemRepository.findOneBy({ facilityItemName });

            const savedMainSwabAreas = mainSwabAreas.map(
                mainSwabArea => {
                    let { subSwabAreas = [], swabAreaName } = mainSwabArea;

                    return {
                        swabAreaName,
                        facilityItem,
                        subSwabAreas: subSwabAreas.map(
                            subSwabArea => {
                                return {
                                    ...subSwabArea,
                                    facilityItem
                                }
                            }
                        )
                    }
                }
            );

            const swabAreas = await swabAreaRepository.save(savedMainSwabAreas);

            console.log(swabAreas);

            async function generateSwabAreaHistory(swabArea, numOfDate = 1, creteSwabTest = true) {
                for (let subIndex = 0; subIndex < numOfDate; subIndex++) {
                    const currentDate = new Date();

                    currentDate.setDate(currentDate.getDate() + subIndex);

                    let createdSwabPeriods = [
                        ...generalSwabPeriods
                    ];

                    if (subIndex === 0) {
                        createdSwabPeriods = [
                            ...createdSwabPeriods,
                            ...bigCleaningSwabPeriods
                        ]
                    };

                    for (let subIndex2 = 0; subIndex2 < createdSwabPeriods.length; subIndex2++) {
                        const swabPeriod = createdSwabPeriods[subIndex2];

                        const historyData = {
                            swabAreaDate: currentDate,
                            swabAreaSwabedAt: null,
                            swabPeriod,
                            swabTest: null,
                            swabArea
                        };

                        if (creteSwabTest) {
                            const swabTest = await swabTestFactory.make({
                                listeriaMonoDetected: null,
                                listeriaMonoValue: null
                            });

                            historyData.swabTest = swabTest;
                        }

                        const swabAreaHistory = await swabAreaHistoryFactory.make(
                            historyData
                        );

                        swabAreaHistories.push(swabAreaHistory);
                    }
                }
            }

            for (let index2 = 0; index2 < swabAreas.length; index2++) {
                const mainSwabArea = swabAreas[index2];

                const { subSwabAreas = [] } = mainSwabArea;

                const shouldMainAreaCreateLabTest = subSwabAreas.length === 0;

                await generateSwabAreaHistory(mainSwabArea, NUMBER_OF_HISTORY_DAY, shouldMainAreaCreateLabTest);

                if (subSwabAreas.length) {
                    for (let index3 = 0; index3 < subSwabAreas.length; index3++) {
                        const subSwabArea = subSwabAreas[index3];

                        await generateSwabAreaHistory(subSwabArea, NUMBER_OF_HISTORY_DAY);
                    }
                }
            }
        }


        // // // // ---------------------------------------------------
        // const facilityFactory = await factoryManager.get(Facility);

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

        //     });
        // }

        await swabAreaHistoryRepository.save(swabAreaHistories);
    }
}