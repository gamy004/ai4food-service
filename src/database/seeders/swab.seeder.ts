import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SwabArea } from '~/swab/entities/swab-area.entity';
import { Facility } from '~/facility/entities/facility.entity';
import { SwabPeriod } from '~/swab/entities/swab-period.entity';

export default class SwabSeeder implements Seeder {
    public async run(
        dataSource: DataSource
    ): Promise<any> {
        // const swabPeriodRepository = dataSource.getRepository(SwabPeriod);

        // const bigCleaningSwabPeriods = await swabPeriodRepository.findBy([
        //     { swabPeriodName: "ก่อน Super Big Cleaning" },
        //     { swabPeriodName: "หลัง Super Big Cleaning" },
        // ]);

        // const generalSwabPeriods = await swabPeriodRepository.findBy([
        //     { swabPeriodName: "หลังประกอบเครื่อง" },
        //     { swabPeriodName: "ก่อนล้างระหว่างงาน" },
        //     { swabPeriodName: "หลังล้างระหว่างงาน" },
        //     { swabPeriodName: "เดินไลน์หลังพัก 4 ชม." },
        //     { swabPeriodName: "ก่อนล้างท้ายกะ" },
        //     { swabPeriodName: "หลังล้างท้ายกะ" },
        // ]);

        const swapAreas = [
            {
                facilityName: "ขึ้นรูป",
                mainSwabAreas: [
                    // {
                    //     swabAreaName: "ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter", // not collected in 22-29 July
                    //     subSwabAreas: [
                    //         { swabAreaName: "ชุดเติมข้าว" },
                    //         { swabAreaName: "สายพานลำเลียง" },
                    //         { swabAreaName: "แกนซุย" },
                    //         { swabAreaName: "ชุด Hopper" },
                    //         { swabAreaName: "Shutter" },
                    //     ]
                    // },
                    {
                        swabAreaName: "ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์",
                        subSwabAreas: [
                            { swabAreaName: "ชุดเติมข้าว ส่วน Sup Weight" },
                            { swabAreaName: "แขนชัตเตอร์" },
                        ]
                    },
                    {
                        swabAreaName: "ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด",
                        subSwabAreas: [
                            { swabAreaName: "ชุดกดหน้าข้าว" },
                            { swabAreaName: "ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด" },
                        ]
                    },
                    {
                        swabAreaName: "ถาดรองเศษใต้ Portion", subSwabAreas: []
                    },
                    {
                        swabAreaName: "คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว",
                        subSwabAreas: [
                            { swabAreaName: "คานตู้ control หน้าเครื่อง Portion" },
                            { swabAreaName: "Cover ด้านบนเครื่อง" },
                            { swabAreaName: "ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว" }
                        ]
                    },
                    {
                        swabAreaName: "โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์",
                        subSwabAreas: [
                            { swabAreaName: "โครงชุดเติมข้าว ส่วน Sup Weight" },
                            { swabAreaName: "แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight" },
                            { swabAreaName: "โครงชุดแขนชัตเตอร์" }
                        ]
                    },
                    {
                        swabAreaName: "Cover มอเตอร์ แกนกลางเครื่อง", subSwabAreas: []
                    },
                    {
                        swabAreaName: "Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด",
                        subSwabAreas: [
                            { swabAreaName: "Cover หน้าเครื่องจุดวางถาด" },
                            { swabAreaName: "ชุดกันรอบสายพานลำเลียงถาด" },
                        ]
                    },
                    {
                        swabAreaName: "ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว",
                        subSwabAreas: [
                            { swabAreaName: "ช่องยกคานลิฟท์ด้านหลัง" },
                            { swabAreaName: "ใต้ฐานลิฟท์ยกข้าว" },
                            { swabAreaName: "แขนชุดลิฟท์ยกข้าว" },
                        ]
                    },
                    {
                        swabAreaName: "Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง",
                        subSwabAreas: [
                            { swabAreaName: "Cover ใส" },
                            { swabAreaName: "Cover สแตนเลส" },
                            { swabAreaName: "Slope ท้ายเครื่อง" },
                        ]
                    },
                    // {
                    //     swabAreaName: "สายพานลำเลียงถาด",
                    //     subSwabAreas: [
                    //         { swabAreaName: "ตัวแผ่น" },
                    //         { swabAreaName: "ตัวกั้น" },
                    //     ]
                    // },
                    {
                        swabAreaName: "เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน",
                        subSwabAreas: [
                            { swabAreaName: "เลื่อนสายพาน" },
                            { swabAreaName: "รอยต่อโครงสร้างด้านใต้สายพาน" },
                        ]
                    },
                    {
                        swabAreaName: "ช่องใต้เฟรมสายพาน", subSwabAreas: []
                    },
                    {
                        swabAreaName: "ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control",
                        subSwabAreas: [
                            { swabAreaName: "ขาตั้งเครื่อง" },
                            { swabAreaName: "ใต้ฐานขาตั้งเครื่อง" },
                            { swabAreaName: "ช่องข้างขาตั้งชุด Control" },
                        ]
                    },
                    {
                        swabAreaName: "ด้านบนตู้ Control Infeed และ สายไฟ",
                        subSwabAreas: [
                            { swabAreaName: "ด้านบนตู้ Control Infeed" },
                            { swabAreaName: "สายไฟ" },
                        ]
                    },
                    {
                        swabAreaName: "พื้นใต้เครื่อง Portion", subSwabAreas: []
                    },
                    {
                        swabAreaName: "พื้นห้อง", subSwabAreas: []
                    },
                    {
                        swabAreaName: "ผนังห้อง", subSwabAreas: []
                    },
                    {
                        swabAreaName: "รางระบายน้ำห้อง",
                        subSwabAreas: [
                            { swabAreaName: "กลางราง" },
                            { swabAreaName: "ขอบรางซ้าย" },
                            { swabAreaName: "ขอบรางขวา" },
                            { swabAreaName: "Main Hole" },
                        ]
                    },
                    {
                        swabAreaName: "แป้นกดสบู่ และ อ่างล้างมือ",
                        subSwabAreas: [
                            { swabAreaName: "แป้นกดสบู่" },
                            { swabAreaName: "อ่างล้างมือ" },
                        ]
                    },
                    {
                        swabAreaName: "มือพนักงานช่างประกอบเครื่องหลังล้าง", subSwabAreas: []
                    },
                    {
                        swabAreaName: "สายลมเครื่อง Portion", subSwabAreas: []
                    },
                    {
                        swabAreaName: "เครื่องชั่ง Topping", subSwabAreas: []
                    },
                ]
            },
            {
                facilityName: "ตู้ Vac.",
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
                facilityName: "ตู้ Steam",
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
            // {
            //     facilityName: "กล่องเครื่องมือวิศวะ โซนสุก",
            //     mainSwabAreas: [
            //         { swabAreaName: "ฝากล่อง", subSwabAreas: [] },
            //         { swabAreaName: "ขอบมุม", subSwabAreas: [] },
            //         { swabAreaName: "ประแจ", subSwabAreas: [] },
            //     ]
            // },
            {
                facilityName: "รถเข็นกะบะ",
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
            // {
            //     facilityName: "เครื่องซุยข้าว Aiho No.2",
            //     mainSwabAreas: [
            //         {
            //             swabAreaName: "แกนสายพาน",
            //             subSwabAreas: [
            //                 { swabAreaName: "แกนกลาง" },
            //                 { swabAreaName: "ก้านซุย" },
            //             ]
            //         },
            //         {
            //             swabAreaName: "สายพานและแผ่นเพลท",
            //             subSwabAreas: [
            //                 { swabAreaName: "สายพาน - กลาง" },
            //                 { swabAreaName: "สายพาน - ขอบซ้าย" },
            //                 { swabAreaName: "สายพาน - ขอบขวา" },
            //                 { swabAreaName: "แผ่นเพลท" },
            //             ]
            //         },
            //     ]
            // },
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

                const savedMainSwabAreas = mainSwabAreas.map(
                    mainSwabArea => {
                        let { subSwabAreas = [], swabAreaName } = mainSwabArea;

                        return {
                            swabAreaName,
                            facility,
                            subSwabAreas: subSwabAreas.map(
                                subSwabArea => {
                                    return {
                                        ...subSwabArea,
                                        facility
                                    }
                                }
                            )
                        }
                    }
                );

                await swabAreaRepository.save(savedMainSwabAreas);
            }
        }
    }
}