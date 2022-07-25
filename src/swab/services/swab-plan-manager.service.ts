import { differenceInDays } from 'date-fns'
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { format } from "date-fns-tz";
import { Repository } from "typeorm";
import { Shift } from "~/common/enums/shift";
import { BodyCommandUpdateSwabPlanByIdDto } from "../dto/command-update-swab-plan-by-id.dto";
import { QuerySwabPlanDto } from "../dto/query-swab-plan.dto";
import { UpsertSwabAreaHistoryImageDto } from "../dto/upsert-swab-area-history-image.dto";
import { UpsertSwabEnvironmentDto } from "../dto/upsert-swab-environment.dto";
import { SwabAreaHistoryImage } from "../entities/swab-area-history-image.entity";
import { SwabAreaHistory } from "../entities/swab-area-history.entity";
import { SwabArea } from "../entities/swab-area.entity";
import { SwabEnvironment } from "../entities/swab-environment.entity";
import { SwabTest } from "../entities/swab-test.entity";
import { SwabPeriodService } from "./swab-period.service";
import { ProductService } from '~/product/product.service';
import { BodyCommandUpdateSwabProductHistoryByIdDto } from '../dto/command-update-swab-product-history-by-id.dto';

@Injectable()
export class SwabPlanManagerService {
    constructor(
        protected readonly productService: ProductService,
        protected readonly swabPeriodService: SwabPeriodService,
        @InjectRepository(SwabAreaHistory)
        protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
        @InjectRepository(SwabArea)
        protected readonly swabAreaRepository: Repository<SwabArea>,
        @InjectRepository(SwabEnvironment)
        protected readonly swabEnvironmentRepository: Repository<SwabEnvironment>,
        @InjectRepository(SwabAreaHistoryImage)
        protected readonly swabAreaHistoryImageRepository: Repository<SwabAreaHistoryImage>,

    ) { }

    async commandUpdateSwabPlanById(id: string, bodycommandUpdateSwabPlanByIdDto: BodyCommandUpdateSwabPlanByIdDto): Promise<void> {
        const {
            swabAreaSwabedAt,
            swabAreaTemperature,
            swabAreaHumidity,
            swabAreaNote,
            productLot,
            product: connectProductDto,
            swabEnvironments: upsertSwabEnvironmentDto = [],
            swabAreaHistoryImages: upsertSwabAreaHistoryImageDto = []
        } = bodycommandUpdateSwabPlanByIdDto;

        const swabAreaHistory = await this.swabAreaHistoryRepository.findOneBy({ id });

        swabAreaHistory.swabAreaSwabedAt = swabAreaSwabedAt;

        swabAreaHistory.product = this.productService.init(connectProductDto);
        swabAreaHistory.productLot = productLot;

        if (swabAreaTemperature) {
            swabAreaHistory.swabAreaTemperature = swabAreaTemperature;
        }

        if (swabAreaHumidity) {
            swabAreaHistory.swabAreaHumidity = swabAreaHumidity;
        }

        if (swabAreaNote) {
            swabAreaHistory.swabAreaNote = swabAreaNote;
        }

        let swabEnvironments = upsertSwabEnvironmentDto.map(
            (upsertSwabEnvironmentData: UpsertSwabEnvironmentDto) => this.swabEnvironmentRepository.create(upsertSwabEnvironmentData)
        )

        if (swabEnvironments.length) {
            swabAreaHistory.swabEnvironments = swabEnvironments;
        }

        let swabAreaHistoryImages = upsertSwabAreaHistoryImageDto.map(
            (upsertSwabAreaHistoryImageData: UpsertSwabAreaHistoryImageDto) => this.swabAreaHistoryImageRepository.create(upsertSwabAreaHistoryImageData)
        )

        if (swabAreaHistoryImages.length) {
            swabAreaHistory.swabAreaHistoryImages = swabAreaHistoryImages;
        }

        await this.swabAreaHistoryRepository.save(swabAreaHistory);
    }

    async commandUpdateSwabProductHistoryById(id: string, bodyCommandUpdateSwabProductHistoryByIdDto: BodyCommandUpdateSwabProductHistoryByIdDto): Promise<void> {

    }

    async generateSwabPlan(querySwabPlanDto: QuerySwabPlanDto) {
        const { fromDate: fromDateString, toDate: toDateString } = querySwabPlanDto;

        let fromDate, toDate;

        if (fromDateString) {
            fromDate = new Date(fromDateString);

            fromDate.setMinutes(0, 0, 0);

            fromDate = format(fromDate, "yyyy-MM-dd");
        }

        if (toDateString) {
            toDate = new Date(toDateString);

            toDate.setMinutes(0, 0, 0);

            toDate = format(toDate, "yyyy-MM-dd");
        }

        // const NUMBER_OF_HISTORY_DAY: number = fromDateString === toDateString
        //   ? 1
        //   : differenceInDays(new Date(toDate), new Date(fromDate));

        const NUMBER_OF_HISTORY_DAY: number = differenceInDays(new Date(toDate), new Date(fromDate))

        const bigCleaningSwabPeriodsTemplate = [
            { swabPeriodName: "ก่อน Super Big Cleaning" },
            { swabPeriodName: "หลัง Super Big Cleaning" }
        ];

        let result_bigClean = await this.swabPeriodService.find([
            { swabPeriodName: "ก่อน Super Big Cleaning", deletedAt: null },
            { swabPeriodName: "หลัง Super Big Cleaning", deletedAt: null },
        ]);

        const bigCleaningSwabPeriods = result_bigClean.reduce((acc, obj) => {
            let key = obj['swabPeriodName']
            if (!acc[key]) {
                acc[key] = {}
            }
            acc[key] = obj
            return acc
        }, {})

        const generalSwabPeriodsTemplate = [
            { swabPeriodName: "หลังประกอบเครื่อง" },
            { swabPeriodName: "ก่อนล้างระหว่างงาน" },
            { swabPeriodName: "หลังล้างระหว่างงาน" },
            { swabPeriodName: "เดินไลน์หลังพัก 4 ชม." },
            { swabPeriodName: "ก่อนล้างท้ายกะ" },
            { swabPeriodName: "หลังล้างท้ายกะ" }
        ];

        let result_general = await this.swabPeriodService.find([
            { swabPeriodName: "หลังประกอบเครื่อง", deletedAt: null },
            { swabPeriodName: "ก่อนล้างระหว่างงาน", deletedAt: null },
            { swabPeriodName: "หลังล้างระหว่างงาน", deletedAt: null },
            { swabPeriodName: "เดินไลน์หลังพัก 4 ชม.", deletedAt: null },
            { swabPeriodName: "ก่อนล้างท้ายกะ", deletedAt: null },
            { swabPeriodName: "หลังล้างท้ายกะ", deletedAt: null },
        ]);

        const generalSwabPeriods = result_general.reduce((acc, obj) => {
            let key = obj['swabPeriodName']
            if (!acc[key]) {
                acc[key] = {}
            }
            acc[key] = obj
            return acc
        }, {})


        const swabAreasTemplate = [
            {
                facilityItemName: "ไลน์4 ขึ้นรูป2",
                mainSwabAreas: [
                    // {
                    //   swabAreaName: "ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter",
                    //   subSwabAreas: [
                    //     { swabAreaName: "ชุดเติมข้าว" },
                    //     { swabAreaName: "สายพานลำเลียง" },
                    //     { swabAreaName: "แกนซุย" },
                    //     { swabAreaName: "ชุด Hopper" },
                    //     { swabAreaName: "Shutter" },
                    //   ]
                    // },
                    {
                        swabAreaName: "ถาดรองเศษใต้ Portion", subSwabAreas: []
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
                        swabAreaName: "พื้นใต้เครื่อง Portion", subSwabAreas: []
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
            // {
            //   facilityItemName: "กล่องเครื่องมือวิศวะ โซนสุก",
            //   mainSwabAreas: [
            //     { swabAreaName: "ฝากล่อง", subSwabAreas: [] },
            //     { swabAreaName: "ขอบมุม", subSwabAreas: [] },
            //     { swabAreaName: "ประแจ", subSwabAreas: [] },
            //   ]
            // },
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
            // {
            //   facilityItemName: "เครื่องซุยข้าว Aiho No.2",
            //   mainSwabAreas: [
            //     {
            //       swabAreaName: "แกนสายพาน",
            //       subSwabAreas: [
            //         { swabAreaName: "แกนกลาง" },
            //         { swabAreaName: "ก้านซุย" },
            //       ]
            //     },
            //     {
            //       swabAreaName: "สายพานและแผ่นเพลท",
            //       subSwabAreas: [
            //         { swabAreaName: "สายพาน - กลาง" },
            //         { swabAreaName: "สายพาน - ขอบซ้าย" },
            //         { swabAreaName: "สายพาน - ขอบขวา" },
            //         { swabAreaName: "แผ่นเพลท" },
            //       ]
            //     },
            //   ]
            // },
        ];

        const swabAreaHistories = [];
        const swabAreas = [];

        for (let index = 0; index < swabAreasTemplate.length; index++) {
            const { facilityItemName, mainSwabAreas = [] } = swabAreasTemplate[index];

            const fetchSwabAreas = await Promise.all(mainSwabAreas.map(
                async (mainSwabArea) => {
                    const swabArea = await this.swabAreaRepository.findOne({
                        where: {
                            swabAreaName: mainSwabArea.swabAreaName,
                            facilityItem: {
                                facilityItemName
                            }
                        },
                        relations: ['subSwabAreas']
                    });

                    if (swabArea) {
                        const { subSwabAreas: subSwabAreasByApi } = swabArea;
                        const { subSwabAreas: subSwabAreasByTemplate } = mainSwabArea

                        const subSwabAreaDatas = subSwabAreasByApi.reduce((acc, obj) => {
                            let key = obj['swabAreaName']
                            if (!acc[key]) {
                                acc[key] = {}
                            }
                            acc[key] = obj
                            return acc
                        }, {})

                        let subSwabAreas = [];

                        for (let index = 0; index < subSwabAreasByTemplate.length; index++) {
                            const element = subSwabAreaDatas[subSwabAreasByTemplate[index].swabAreaName];
                            subSwabAreas.push(element)
                        }
                        return {
                            ...swabArea,
                            subSwabAreas: [...subSwabAreas]
                        }
                    }
                }
            ));
            swabAreas.push(fetchSwabAreas)
        }

        async function generateSwabAreaHistory(swabAreaDate, swabArea, swabPeriod, shift = null, creteSwabTest = true) {
            const historyData = {
                swabAreaDate: format(swabAreaDate, "yyyy-MM-dd"),
                swabAreaSwabedAt: null,
                swabAreaTemperature: null,
                swabAreaHumidity: null,
                swabAreaAtp: null,
                swabPeriod,
                swabTest: null,
                swabArea,
                shift
            };

            if (creteSwabTest) {
                const swabTestData = SwabTest.create({
                    listeriaMonoDetected: null,
                    listeriaMonoValue: null
                });

                historyData.swabTest = swabTestData;
            }

            const swabAreaHistory = SwabAreaHistory.create(historyData);

            return swabAreaHistories.push(swabAreaHistory);
        }

        async function generateHistory(swabAreasAll, currentDate = new Date(), dateIndex) {
            currentDate.setDate(currentDate.getDate() + dateIndex);

            if (dateIndex === 0) {
                for (let index = 0; index < bigCleaningSwabPeriodsTemplate.length; index++) {
                    const bigCleaningSwabPeriod = bigCleaningSwabPeriods[bigCleaningSwabPeriodsTemplate[index].swabPeriodName];
                    for (let index = 0; index < swabAreasAll.length; index++) {
                        const swabAreasGroupByFacilityItem = swabAreasAll[index];

                        for (let index = 0; index < swabAreasGroupByFacilityItem.length; index++) {
                            const swabAreas = swabAreasGroupByFacilityItem[index];
                            const { subSwabAreas = null } = swabAreas;
                            const createSwabTest = subSwabAreas && subSwabAreas.length === 0;

                            await generateSwabAreaHistory(
                                currentDate,
                                swabAreas,
                                bigCleaningSwabPeriod,
                                null,
                                createSwabTest
                            );

                            if (subSwabAreas && subSwabAreas.length > 0) {
                                for (let index3 = 0; index3 < subSwabAreas.length; index3++) {
                                    const swabArea = subSwabAreas[index3];
                                    await generateSwabAreaHistory(
                                        currentDate,
                                        swabArea,
                                        bigCleaningSwabPeriod,
                                        null,
                                        true
                                    );
                                }
                            }
                        }
                    }
                }
            }

            for (let index2 = 0; index2 < Object.keys(Shift).length; index2++) {
                const shiftKey = Object.keys(Shift)[index2];

                for (let index = 0; index < generalSwabPeriodsTemplate.length; index++) {
                    const swabPeriod = generalSwabPeriods[generalSwabPeriodsTemplate[index].swabPeriodName];

                    for (let index3 = 0; index3 < swabAreasAll.length; index3++) {
                        const swabAreasGroupByFacilityItem = swabAreasAll[index3];

                        for (let index = 0; index < swabAreasGroupByFacilityItem.length; index++) {
                            const swabAreas = swabAreasGroupByFacilityItem[index];

                            const { subSwabAreas = null } = swabAreas;

                            const createSwabTest = subSwabAreas && subSwabAreas.length === 0;

                            await generateSwabAreaHistory(
                                currentDate,
                                swabAreas,
                                swabPeriod,
                                Shift[shiftKey],
                                createSwabTest
                            );

                            if (subSwabAreas && subSwabAreas.length > 0) {
                                for (let index4 = 0; index4 < subSwabAreas.length; index4++) {
                                    const swabArea = subSwabAreas[index4];

                                    await generateSwabAreaHistory(
                                        currentDate,
                                        swabArea,
                                        swabPeriod,
                                        Shift[shiftKey],
                                        true
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        for (let dateIndex = 0; dateIndex <= NUMBER_OF_HISTORY_DAY; dateIndex++) {
            const currentDate = new Date(fromDate);

            await generateHistory(swabAreas, currentDate, dateIndex);
        }

        await this.swabAreaHistoryRepository.save(swabAreaHistories);

        return;
    }
}