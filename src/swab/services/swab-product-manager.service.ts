import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwabPeriodService } from './swab-period.service';
import { FacilityItemService } from '~/facility/services/facility-item.service';
import { SwabProductHistory } from '../entities/swab-product-history.entity';
import { User } from '~/auth/entities/user.entity';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { BodyCommandUpdateSwabProductByIdDto } from '../dto/command-update-swab-product-history-by-id.dto';
import { BodyCommandCreateSwabProductByIdDto } from '../dto/command-create-swab-product-history.dto';
import { RunningNumberService } from '~/common/services/running-number.service';
import { format } from 'date-fns-tz';
import { SwabTest } from '../entities/swab-test.entity';
import { SwabProductHistoryService } from './swab-product-history.service';
import { GenerateSwabProductPlanDto } from '../dto/generate-swab-product-plan.dto';
import { SwabRoundService } from './swab-round.service';
import { differenceInDays } from 'date-fns';
import { SwabArea } from '../entities/swab-area.entity';
import { Shift } from '~/common/enums/shift';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { ProductService } from '~/product/services/product.service';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { SwabSampleTypeService } from './swab-sample-type.service';

@Injectable()
export class SwabProductManagerService {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly dateTransformer: DateTransformer,
    protected readonly facilityItemService: FacilityItemService,
    protected readonly productService: ProductService,
    protected readonly swabPeriodService: SwabPeriodService,
    protected readonly swabProductHistoryService: SwabProductHistoryService,
    private readonly runningNumberService: RunningNumberService,
    protected readonly swabRoundService: SwabRoundService,
    protected readonly swabSampleTypeService: SwabSampleTypeService,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,
    @InjectRepository(SwabProductHistory)
    protected readonly swabProductHistoryRepository: Repository<SwabProductHistory>,
    @InjectRepository(FacilityItem)
    protected readonly facilityItemRepository: Repository<FacilityItem>,
  ) {}

  async commandCreateSwabProductHistory(
    body: BodyCommandCreateSwabProductByIdDto,
    recordedUser: User,
  ): Promise<SwabProductHistory> {
    const swabProductHistoryData = SwabProductHistory.create(body);
    const SWAB_TEST_CODE_PREFIX = 'FG';

    if (recordedUser) {
      swabProductHistoryData.recordedUser = recordedUser;
    }

    const swabTestCodeDate = format(new Date(), 'yyyyMMdd');
    const runningNumberSwabCode = await this.runningNumberService.generate({
      key: swabTestCodeDate,
    });

    if (runningNumberSwabCode) {
      const swabTestData = SwabTest.create({
        swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${runningNumberSwabCode}/${swabTestCodeDate}`,
      });

      swabProductHistoryData.swabTest = swabTestData;
    }

    return await this.swabProductHistoryService.create(swabProductHistoryData);
  }

  async commandUpdateSwabProductHistoryById(
    id: string,
    body: BodyCommandUpdateSwabProductByIdDto,
    recordedUser: User,
  ): Promise<void> {
    const {
      swabProductSwabedAt,
      swabProductDate,
      swabProductNote,
      shift,
      product: connectProductDto,
      swabPeriod: connectSwabPeriodDto,
      productDate,
      productLot,
      facilityItem: connectFacilityItemDto,
      swabSampleType: connectSwabSampleTypeDto,
    } = body;

    const swabProductHistory = await this.swabProductHistoryService.findOneBy({
      id,
    });

    if (recordedUser) {
      swabProductHistory.recordedUser = recordedUser;
    }

    if (swabProductDate) {
      swabProductHistory.swabProductDate =
        this.dateTransformer.toObject(swabProductDate);
    }

    if (swabProductSwabedAt) {
      swabProductHistory.swabProductSwabedAt = swabProductSwabedAt;
    }

    if (swabProductNote) {
      swabProductHistory.swabProductNote = swabProductNote;
    }

    if (connectProductDto) {
      swabProductHistory.product = this.productService.make(connectProductDto);
    }

    if (connectSwabPeriodDto) {
      swabProductHistory.swabPeriod =
        this.swabPeriodService.make(connectSwabPeriodDto);
    }

    if (productDate) {
      swabProductHistory.productDate =
        this.dateTransformer.toObject(productDate);
    }

    if (productLot) {
      swabProductHistory.productLot = productLot;
    }

    if (shift) {
      swabProductHistory.shift = shift;
    }

    if (connectFacilityItemDto) {
      swabProductHistory.facilityItem = this.facilityItemService.make(
        connectFacilityItemDto,
      );
    }

    if (connectSwabSampleTypeDto) {
      swabProductHistory.swabSampleType = this.swabSampleTypeService.make(
        connectSwabSampleTypeDto,
      );
    }

    await this.swabProductHistoryService.save(swabProductHistory);
  }

  async commandDeleteSwabProductHistoryById(id: string): Promise<void> {
    const swabProductHistory = await this.swabProductHistoryService.findOne({
      where: { id },
      relations: {
        swabTest: true,
      },
    });

    await this.swabProductHistoryService.removeOne(swabProductHistory);
  }

  async generateSwabProductPlan(
    generateSwabProductPlanDto: GenerateSwabProductPlanDto,
  ) {
    const {
      fromDate,
      toDate,
      roundNumberSwabTest,
      skipBigCleaning = false,
      includeDayShiftFirstDay = false,
      includeNightShiftFirstDay = true,
      includeNightShiftLastDay = false,
    } = generateSwabProductPlanDto;

    let swabRound = await this.swabRoundService.findOneBy({
      swabRoundNumber: roundNumberSwabTest,
    });

    if (!swabRound) {
      swabRound = await this.swabRoundService.create({
        swabRoundNumber: roundNumberSwabTest,
      });
    }

    const runningNumberKey = `swab-product-history-round-${swabRound.swabRoundNumber}`;

    let latestRunningNumber = 1;

    const latestRunningNumberEntity = await this.runningNumberService.findOneBy(
      {
        key: runningNumberKey,
      },
    );

    if (!latestRunningNumberEntity) {
      latestRunningNumber = await this.runningNumberService.generate({
        key: runningNumberKey,
      });
    } else {
      latestRunningNumber = latestRunningNumberEntity.latestRunningNumber + 1;
    }

    const NUMBER_OF_HISTORY_DAY: number = differenceInDays(
      new Date(toDate),
      new Date(fromDate),
    );

    let bigCleaningSwabPeriodsTemplate = [];
    let result_bigClean = [];

    if (!skipBigCleaning) {
      bigCleaningSwabPeriodsTemplate = [
        { swabPeriodName: 'ก่อน Super Big Cleaning', deletedAt: null },
        // { swabPeriodName: "หลัง Super Big Cleaning", deletedAt: null },
      ];

      result_bigClean = await this.swabPeriodService.findBy(
        bigCleaningSwabPeriodsTemplate,
      );
    }

    const bigCleaningSwabPeriods = result_bigClean.reduce((acc, obj) => {
      let key = obj['swabPeriodName'];
      if (!acc[key]) {
        acc[key] = {};
      }
      acc[key] = obj;
      return acc;
    }, {});

    const generalSwabPeriodsTemplate = [
      { swabPeriodName: 'หลังประกอบเครื่อง', deletedAt: null },
      { swabPeriodName: 'ก่อนล้างระหว่างงาน', deletedAt: null },
      // { swabPeriodName: "หลังล้างระหว่างงาน", deletedAt: null },
      // { swabPeriodName: "เดินไลน์หลังพัก 4 ชม.", deletedAt: null },
      { swabPeriodName: 'ก่อนล้างท้ายกะ', deletedAt: null },
      // { swabPeriodName: "หลังล้างท้ายกะ", deletedAt: null }
    ];

    let result_general = await this.swabPeriodService.findBy(
      generalSwabPeriodsTemplate,
    );

    const generalSwabPeriods = result_general.reduce((acc, obj) => {
      let key = obj['swabPeriodName'];
      if (!acc[key]) {
        acc[key] = {};
      }
      acc[key] = obj;
      return acc;
    }, {});

    // const generalProductTemplate = [
    //   { productName: 'ข้าวไข่เจียวกุ้ง' },
    //   { productName: 'ปลาผัดพริก' },
    //   { productName: 'กะเพราไก่' },
    //   { productName: 'ข้าวพะแนง' },
    //   { productName: 'กะเพราหมู' },
    // ];

    // let result_product = await this.productService.findBy([
    //   { productName: 'ข้าวไข่เจียวกุ้ง', deletedAt: null },
    //   { productName: 'ปลาผัดพริก', deletedAt: null },
    //   { productName: 'กะเพราไก่', deletedAt: null },
    //   { productName: 'ข้าวพะแนง', deletedAt: null },
    //   { productName: 'กะเพราหมู', deletedAt: null },
    // ]);

    // const generalProduct = result_product.reduce((acc, obj) => {
    //   let key = obj['productName'];
    //   if (!acc[key]) {
    //     acc[key] = {};
    //   }
    //   acc[key] = obj;
    //   return acc;
    // }, {});

    const facilitysTemplate = [
      {
        facilityName: 'ขึ้นรูป',
        // mainFacilityItems: [
        //     { facilityItemName: "ขึ้นรูป1" },
        //     { facilityItemName: "ขึ้นรูป2" },
        //     { facilityItemName: "ขึ้นรูป3" },
        //     { facilityItemName: "ไลน์1 ขึ้นรูป1" },
        //     { facilityItemName: "ไลน์2 ขึ้นรูป1" },
        //     { facilityItemName: "ไลน์3 ขึ้นรูป2" },
        //     { facilityItemName: "ไลน์4 ขึ้นรูป2" },
        //     { facilityItemName: "ไลน์5 ขึ้นรูป2" },
        //     { facilityItemName: "ไลน์6 ขึ้นรูป3" },
        //     { facilityItemName: "ไลน์7 ขึ้นรูป3" },
        //     { facilityItemName: "ไลน์8 ขึ้นรูป3" },
        //     { facilityItemName: "ไลน์9 ขึ้นรูป3" },
        //     { facilityItemName: "ไลน์10 ขึ้นรูป3" },
        //     { facilityItemName: "ไลน์11 ขึ้นรูป1" }
        // ],
        swabPeriodMapping: [],
        // shiftMapping: ['day'],
      },
      // {
      //     facilityName: "ตู้ Steam",
      //     mainFacilityItems: [
      //         { facilityItemName: "ตู้ Steam โซนสุก No.1" },
      //         { facilityItemName: "ตู้ Steam โซนสุก No.2" },
      //         { facilityItemName: "ตู้ Steam โซนสุก No.3" },
      //         { facilityItemName: "ตู้ Steam โซนสุก No.4" }
      //     ],
      //     swabPeriodMapping: [
      //         "ก่อน Super Big Cleaning"
      //     ],
      //     shiftMapping: [
      //         'day'
      //     ]
      // },
      // {
      //     facilityName: "ตู้ Vac.",
      //     mainFacilityItems: [
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.1" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.2" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.3" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.4" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.5" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.11" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.12" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.13" },
      //         { facilityItemName: "ตู้ Vac. โซนสุก No.14" }
      //     ],
      //     swabPeriodMapping: [
      //         "ก่อน Super Big Cleaning"
      //     ],
      //     shiftMapping: [
      //         'day'
      //     ]
      // },
      // {
      //     facilityName: "รถเข็นกะบะ",
      //     mainFacilityItems: [
      //         { facilityItemName: "รถเข็นกะบะ โซนสุก" }
      //     ],
      //     swabPeriodMapping: [
      //         "ก่อน Super Big Cleaning"
      //     ],
      //     shiftMapping: [
      //         'day'
      //     ]
      // }
    ];

    const swabProductHistories = [];
    const SWAB_TEST_CODE_PREFIX = 'FG';
    let SWAB_TEST_START_NUMBER_PREFIX = latestRunningNumber;

    this.transaction.execute(async () => {
      function generateSwabProductHistory(
        swabProductDate,
        swabPeriod,
        shift = null,
        createSwabTest = true,
      ) {
        const historyData = {
          swabProductDate: format(swabProductDate, 'yyyy-MM-dd'),
          swabProductSwabedAt: null,
          swabProductNote: null,
          product: null,
          swabPeriod,
          swabTest: null,
          facilityItem: null,
          shift,
          productLot: null,
          recordedUser: null,
          swabRound: null,
        };

        if (createSwabTest) {
          const swabTestData = SwabTest.create({
            swabTestCode: `${
              roundNumberSwabTest ? roundNumberSwabTest + '/' : ''
            }${SWAB_TEST_CODE_PREFIX}${SWAB_TEST_START_NUMBER_PREFIX}`,
            swabTestOrder: SWAB_TEST_START_NUMBER_PREFIX,
          });

          if (swabRound) {
            swabTestData.swabRound = swabRound;
          }

          historyData.swabTest = swabTestData;

          SWAB_TEST_START_NUMBER_PREFIX = SWAB_TEST_START_NUMBER_PREFIX + 1;
        }

        if (swabRound) {
          historyData.swabRound = swabRound;
        }

        const swabProductHistory = SwabProductHistory.create(historyData);

        swabProductHistories.push(swabProductHistory);
      }

      function generateHistory(currentDate, dateIndex) {
        let shiftKeys = Object.keys(Shift);

        if (dateIndex === 0) {
          for (
            let index = 0;
            index < bigCleaningSwabPeriodsTemplate.length;
            index++
          ) {
            const bigCleaningSwabPeriod =
              bigCleaningSwabPeriods[
                bigCleaningSwabPeriodsTemplate[index].swabPeriodName
              ];

            generateSwabProductHistory(
              currentDate,
              bigCleaningSwabPeriod,
              'day',
              true,
            );
          }

          if (!includeDayShiftFirstDay) {
            shiftKeys = shiftKeys.filter((key) => key === 'DAY');
          }

          if (!includeNightShiftFirstDay) {
            shiftKeys = shiftKeys.filter((key) => key === 'NIGHT');
          }
        }

        if (dateIndex !== 0 && dateIndex === NUMBER_OF_HISTORY_DAY) {
          if (!includeNightShiftLastDay) {
            shiftKeys = shiftKeys.filter((key) => key === 'NIGHT');
          }
        }

        for (let index2 = 0; index2 < shiftKeys.length; index2++) {
          const shiftKey = shiftKeys[index2];

          for (
            let index = 0;
            index < generalSwabPeriodsTemplate.length;
            index++
          ) {
            const swabPeriod =
              generalSwabPeriods[
                generalSwabPeriodsTemplate[index].swabPeriodName
              ];

            for (let index3 = 0; index3 < facilitysTemplate.length; index3++) {
              const { swabPeriodMapping = [] } = facilitysTemplate[index3];

              if (
                swabPeriodMapping.length &&
                !swabPeriodMapping.includes(swabPeriod.swabPeriodName)
              ) {
                continue;
              }

              generateSwabProductHistory(
                currentDate,
                swabPeriod,
                Shift[shiftKey],
                true,
              );
            }
          }
        }

        // special case of final day (latest swab round 3 doesn't have this case anymore)
        // if (dateIndex !== 0 && dateIndex === NUMBER_OF_HISTORY_DAY) {
        //   generateSwabProductHistory(
        //     currentDate,
        //     generalSwabPeriods['หลังประกอบเครื่อง'],
        //     'night',
        //     true,
        //   );
        // }
      }

      const currentDate = new Date(fromDate);

      for (let dateIndex = 0; dateIndex <= NUMBER_OF_HISTORY_DAY; dateIndex++) {
        generateHistory(currentDate, dateIndex);

        currentDate.setDate(currentDate.getDate() + 1);
      }

      await this.swabProductHistoryRepository.save(swabProductHistories, {
        transaction: false,
      });

      if (SWAB_TEST_START_NUMBER_PREFIX > latestRunningNumber) {
        await this.runningNumberService.update(
          { key: runningNumberKey },
          { latestRunningNumber: SWAB_TEST_START_NUMBER_PREFIX - 1 },
        );
      }
    });

    return;
  }
}
