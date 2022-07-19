import { format } from 'date-fns-tz';
import { differenceInDays } from 'date-fns'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSwabDto } from '../dto/create-swab.dto';
import { UpdateSwabDto } from '../dto/update-swab.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabTest } from '../entities/swab-test.entity';
import { SwabPeriodService } from './swab-period.service'
import { SwabAreaService } from './swab-area.service'
import { FindOptionsWhere, In, IsNull, Not, Raw, Repository } from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Shift } from '~/common/enums/shift';
import { FacilityItemService } from '~/facility/facility-item.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';

function transformQuerySwabPlanDto(querySwabPlanDto: QuerySwabPlanDto): FindOptionsWhere<SwabAreaHistory> {
  const { fromDate: fromDateString, toDate: toDateString } = querySwabPlanDto;

  const where: FindOptionsWhere<SwabAreaHistory> = {};

  let fromDate, toDate;

  if (fromDateString) {
    fromDate = new Date(fromDateString);

    fromDate.setMinutes(0, 0, 0);

    fromDate = format(fromDate, "yyyy-MM-dd");
  }

  if (toDateString) {
    toDate = new Date(toDateString);

    toDate.setDate(toDate.getDate() + 1);

    toDate.setMinutes(0, 0, 0);

    toDate = format(toDate, "yyyy-MM-dd");
  }

  if (fromDate && toDate) {
    where.swabAreaDate = Raw(field => `${field} >= '${fromDate}' and ${field} < '${toDate}'`);
  } else {
    if (fromDate) {
      where.swabAreaDate = Raw(field => `${field} >= '${fromDate}'`);
    }

    if (toDate) {
      where.swabAreaDate = Raw(field => `${field} < '${toDate}'`);
    }
  }

  return where;
}

@Injectable()
export class SwabService {
  constructor(

    protected readonly facilityItemService: FacilityItemService,
    protected readonly swabPeriodService: SwabPeriodService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,
    @InjectRepository(SwabTest)
    protected readonly swabTestRepository: Repository<SwabTest>
  ) { }

  create(createSwabDto: CreateSwabDto) {
    return 'This action adds a new swab';
  }

  async querySwabPlan(querySwabPlanDto: QuerySwabPlanDto): Promise<ResponseSwabPlanDto> {
    const where: FindOptionsWhere<SwabAreaHistory> = transformQuerySwabPlanDto(
      querySwabPlanDto
    );

    const swabPeriods = await this.swabPeriodService.findAll({
      select: {
        id: true,
        swabPeriodName: true
      }
    });

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      where: {
        ...where,
        swabTestId: Not(IsNull())
      },
      relations: {
        //   swabPeriod: true,
        //   swabArea: true,
        swabTest: true
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabPeriodId: true,
        swabAreaId: true,
        shift: true,
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true
        }
      },
      order: {
        swabTest: {
          id: {
            direction: 'asc'
          }
        }
      }
    });

    let facilityItems = [];
    let swabAreas = [];

    if (swabAreaHistories.length) {
      const swabAreaIds = [...new Set(swabAreaHistories.map(({ swabAreaId }) => swabAreaId))].filter(Boolean);

      if (swabAreaIds.length) {
        swabAreas = await this.swabAreaRepository.find({
          where: {
            id: In(swabAreaIds)
          },
          select: {
            id: true,
            swabAreaName: true,
            mainSwabAreaId: true,
            facilityItemId: true
          }
        });
      }

      if (swabAreas.length) {
        let mainSwabAreas = [];

        const facilityItemIds = [...new Set(swabAreas.map(({ facilityItemId }) => facilityItemId))].filter(Boolean);

        if (facilityItemIds.length) {
          facilityItems = await this.facilityItemService.findAll({
            where: {
              id: In(facilityItemIds)
            },
            select: {
              id: true,
              facilityItemName: true,
              facilityId: true,
              roomId: true,
              zoneId: true
            }
          });
        }

        const mainSwabAreaIds = [...new Set(swabAreas.map(({ mainSwabAreaId }) => mainSwabAreaId))].filter(Boolean);

        if (mainSwabAreaIds.length) {
          mainSwabAreas = await this.swabAreaRepository.findBy({
            id: In(mainSwabAreaIds)
          });
        }

        if (mainSwabAreas.length) {
          swabAreas = [
            ...swabAreas,
            ...mainSwabAreas
          ];
        }
      }
    }
    return {
      swabPeriods,
      swabAreaHistories,
      swabAreas,
      facilityItems
    };
  }

  private async transformQueryUpdateSwabPlanDto(querySwabPlanDto: QueryUpdateSwabPlanDto): Promise<FindOptionsWhere<SwabAreaHistory>[]> {
    let { swabAreaDate: swabAreaDateString, shift, facilityItemId, mainSwabAreaId, swabPeriodId } = querySwabPlanDto;

    let swabAreaDate = new Date(swabAreaDateString);

    swabAreaDate.setMinutes(0, 0, 0);

    const swabPeriod = await this.swabPeriodService.findOne({ id: swabPeriodId });

    if (!swabPeriod.dependsOnShift) {
      shift = null;
    }

    const where: FindOptionsWhere<SwabAreaHistory>[] = [
      {
        swabAreaDate,
        shift,
        swabPeriodId,
        swabArea: {
          id: mainSwabAreaId,
          facilityItemId: facilityItemId
        }
      },
      {
        swabAreaDate,
        shift,
        swabPeriodId,
        swabArea: {
          mainSwabAreaId,
          facilityItemId: facilityItemId
        }
      },
    ];

    return where;
  }

  async queryUpdateSwabPlan(queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto): Promise<SwabAreaHistory[]> {
    const where: FindOptionsWhere<SwabAreaHistory>[] = await this.transformQueryUpdateSwabPlanDto(
      queryUpdateSwabPlanDto
    );

    return await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        swabTest: true,
        swabArea: true,
        swabAreaHistoryImages: true
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabPeriodId: true,
        swabAreaId: true,
        shift: true,
        swabAreaTemperature: true,
        swabAreaHumidity: true,
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true,
        },
        swabAreaHistoryImages: {
          id: true,
          swabAreaHistoryImageUrl: true
        }
      },
      order: {
        swabTest: {
          id: {
            direction: 'asc'
          }
        }
      }
    });
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

    const NUMBER_OF_HISTORY_DAY: number = fromDateString === toDateString
      ? 1
      : differenceInDays(new Date(toDate), new Date(fromDate));

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

          // const swabTest = await this.swabTestRepository.save(swabTestData);

          historyData.swabTest = swabTestData;
        }

        const swabAreaHistory = SwabAreaHistory.create(historyData);

        swabAreaHistories.push(swabAreaHistory);
      }

      async function generateHistory(swabAreas, currentDate = new Date(), dateIndex = 0) {

        currentDate.setDate(currentDate.getDate() + dateIndex);

        if (dateIndex === 0) {
          for (let index = 0; index < bigCleaningSwabPeriodsTemplate.length; index++) {
            const bigCleaningSwabPeriod = bigCleaningSwabPeriods[bigCleaningSwabPeriodsTemplate[index].swabPeriodName];

            for (let index2 = 0; index2 < swabAreas.length; index2++) {
              const mainSwabArea = swabAreas[index2];
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
        };

        for (let index = 0; index < generalSwabPeriodsTemplate.length; index++) {
          const swabPeriod = generalSwabPeriods[generalSwabPeriodsTemplate[index].swabPeriodName];
          for (let index2 = 0; index2 < Object.keys(Shift).length; index2++) {
            const shiftKey = Object.keys(Shift)[index2];
            for (let index3 = 0; index3 < swabAreas.length; index3++) {
              const mainSwabArea = swabAreas[index3];
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
                for (let index4 = 0; index4 < subSwabAreas.length; index4++) {
                  const swabArea = subSwabAreas[index4];
                  await generateSwabAreaHistory(
                    currentDate,
                    swabArea,
                    swabPeriod,
                    null,
                    true
                  );
                }
              }
            }
          }
        }
      }

      for (let dateIndex = 0; dateIndex < NUMBER_OF_HISTORY_DAY; dateIndex++) {
        const currentDate = new Date(fromDate);
        await generateHistory(swabAreas, currentDate, dateIndex);
      }
    }
    await this.swabAreaHistoryRepository.save(swabAreaHistories);
  }

  update(id: number, updateSwabDto: UpdateSwabDto) {
    return `This action updates a #${id} swab`;
  }
}

