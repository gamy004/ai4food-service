import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSwabDto } from '../dto/create-swab.dto';
import { UpdateSwabDto } from '../dto/update-swab.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabTest } from '../entities/swab-test.entity';
import { SwabPeriodService } from './swab-period.service'
import { SwabAreaService } from './swab-area.service'
import { Between, FindOptionsWhere, In, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Shift } from '~/common/enums/shift';

@Injectable()
export class SwabService {
  constructor(
    protected readonly swabPeriodService: SwabPeriodService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,
    @InjectRepository(FacilityItem)
    protected readonly facilityItemRepository: Repository<FacilityItem>,
    @InjectRepository(SwabTest)
    protected readonly swabTestRepository: Repository<SwabTest>
  ) { }

  create(createSwabDto: CreateSwabDto) {
    return 'This action adds a new swab';
  }

  async querySwabPlan(querySwabPlanDto: QuerySwabPlanDto): Promise<ResponseSwabPlanDto> {
    const { fromDate: fromDateString, toDate: toDateString } = querySwabPlanDto;

    const where: FindOptionsWhere<SwabAreaHistory> = {};

    let fromDate, toDate;

    if (fromDateString) {
      fromDate = new Date(fromDateString);

      fromDate.setMinutes(0, 0, 0);
    }

    if (toDateString) {
      toDate = new Date(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate.setMinutes(0, 0, 0);
    }

    if (fromDate && toDate) {
      where.swabAreaDate = Between(fromDate, toDate);
    } else {
      if (fromDate) {
        where.swabAreaDate = MoreThanOrEqual(fromDate);
      } else {
        where.swabAreaDate = LessThan(fromDate);
      }
    }

    const swabPeriods = await this.swabPeriodService.findAll();

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        //   swabPeriod: true,
        //   swabArea: true,
        swabTest: true
      },
      select: {
        swabAreaDate: true,
        swabPeriodId: true,
        swabAreaId: true,
        swabTest: {
          swabTestCode: true
        }
      }
    });

    let swabAreas = [];

    if (swabAreaHistories.length) {
      const swabAreaIds = swabAreaHistories.map(({ swabAreaId }) => swabAreaId);

      if (swabAreaIds.length) {
        swabAreas = await this.swabAreaRepository.findBy({
          id: In(swabAreaIds)
        });
      }
    }
    return {
      swabPeriods,
      swabAreaHistories,
      swabAreas
    };
  }

  async generateSwabPlan(querySwabPlanDto: QuerySwabPlanDto) {
    const { fromDate: fromDateString, toDate: toDateString } = querySwabPlanDto;

    let fromDate, toDate;

    if (fromDateString) {
      fromDate = new Date(fromDateString);

      fromDate.setMinutes(0, 0, 0);
    }

    if (toDateString) {
      toDate = new Date(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate.setMinutes(0, 0, 0);
    }

    const NUMBER_OF_HISTORY_DAY = Math.ceil((toDate - fromDate) / (1000 * 3600 * 24));

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
      {
        facilityItemName: "กล่องเครื่องมือวิศวะ โซนสุก",
        mainSwabAreas: [
          { swabAreaName: "ฝากล่อง", subSwabAreas: [] },
          { swabAreaName: "ขอบมุม", subSwabAreas: [] },
          { swabAreaName: "ประแจ", subSwabAreas: [] },
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

    const swabAreaHistories = [];
    for (let index = 0; index < swabAreasTemplate.length; index++) {

      const { mainSwabAreas = [] } = swabAreasTemplate[index];

      const savedMainSwabAreas = await Promise.all(mainSwabAreas.map(
        async (mainSwabArea) => {
          const swabArea = await this.swabAreaRepository.find({
            where: { swabAreaName: mainSwabArea.swabAreaName },
            relations: ['subSwabAreas']
          });

          if (swabArea && swabArea[0]) {
            const { subSwabAreas: subSwabAreasByApi } = swabArea[0]
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
              ...swabArea[0],
              subSwabAreas: [...subSwabAreas]
            }
          }
        }
      ));

      const swabAreas = savedMainSwabAreas

      async function generateSwabAreaHistory(swabAreaDate, swabArea, swabPeriod, shift = null, creteSwabTest = true) {
        const historyData = {
          swabAreaDate,
          swabAreaSwabedAt: null,
          swabAreaTemperature: 0,
          swabAreaHumidity: 0,
          swabAreaAtp: 0,
          swabPeriod,
          swabTest: null,
          swabArea,
          shift
        };

        if (creteSwabTest) {
          const swabTest = SwabTest.create({
            listeriaMonoDetected: null,
            listeriaMonoValue: null
          });

          historyData.swabTest = swabTest;
        }

        const swabAreaHistory = SwabAreaHistory.create(historyData);

        swabAreaHistories.push(swabAreaHistory);
      }

      async function generateHistory(swabAreas, currentDate = new Date(), subIndex = 0) {

        currentDate.setDate(currentDate.getDate() + subIndex);

        if (subIndex === 0) {
          for (let subIndex2 = 0; subIndex2 < bigCleaningSwabPeriodsTemplate.length; subIndex2++) {
            const bigCleaningSwabPeriod = bigCleaningSwabPeriods[bigCleaningSwabPeriodsTemplate[subIndex2].swabPeriodName];

            for (let index = 0; index < swabAreas.length; index++) {
              const mainSwabArea = swabAreas[index];
              const { subSwabAreas = [] } = mainSwabArea;
              const createSwabTest = subSwabAreas.length === 0;

              await generateSwabAreaHistory(
                currentDate,
                mainSwabArea,
                bigCleaningSwabPeriod,
                null,
                createSwabTest
              );

              if (subSwabAreas.length > 0) {
                for (let index2 = 0; index2 < subSwabAreas.length; index2++) {
                  const swabArea = subSwabAreas[index2];
                  await generateSwabAreaHistory(
                    currentDate,
                    swabArea,
                    bigCleaningSwabPeriod,
                    null,
                    createSwabTest
                  );
                }
              }
            }
          }
        };

        for (let subIndex3 = 0; subIndex3 < generalSwabPeriodsTemplate.length; subIndex3++) {
          const swabPeriod = generalSwabPeriods[generalSwabPeriodsTemplate[subIndex3].swabPeriodName];
          for (let index = 0; index < Object.keys(Shift).length; index++) {
            const shiftKey = Object.keys(Shift)[index];
            for (let index2 = 0; index2 < swabAreas.length; index2++) {
              const mainSwabArea = swabAreas[index2];
              const { subSwabAreas = [] } = mainSwabArea;
              const createSwabTest = subSwabAreas.length === 0;

              await generateSwabAreaHistory(
                currentDate,
                mainSwabArea,
                swabPeriod,
                Shift[shiftKey],
                createSwabTest
              );

              if (subSwabAreas.length > 0) {
                for (let index2 = 0; index2 < subSwabAreas.length; index2++) {
                  const swabArea = subSwabAreas[index2];
                  await generateSwabAreaHistory(
                    currentDate,
                    swabArea,
                    swabPeriod,
                    null,
                    createSwabTest
                  );
                }
              }
            }
          }
        }
      }

      for (let subIndex = 0; subIndex < NUMBER_OF_HISTORY_DAY; subIndex++) {
        const currentDate = new Date(fromDate);
        await generateHistory(swabAreas, currentDate, subIndex);
      }
    }
    return await this.swabAreaHistoryRepository.save(swabAreaHistories);

  }

  update(id: number, updateSwabDto: UpdateSwabDto) {
    return `This action updates a #${id} swab`;
  }
}
