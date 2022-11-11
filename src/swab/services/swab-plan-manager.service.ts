import { differenceInDays } from 'date-fns';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns-tz';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { Shift } from '~/common/enums/shift';
import { BodyCommandUpdateSwabPlanByIdDto } from '../dto/command-update-swab-plan-by-id.dto';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { UpsertSwabAreaHistoryImageDto } from '../dto/upsert-swab-area-history-image.dto';
import { UpsertSwabEnvironmentDto } from '../dto/upsert-swab-environment.dto';
import { SwabAreaHistoryImage } from '../entities/swab-area-history-image.entity';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabEnvironment } from '../entities/swab-environment.entity';
import { SwabTest } from '../entities/swab-test.entity';
import { SwabPeriodService } from './swab-period.service';
import { GenerateSwabPlanDto } from '../dto/generate-swab-plan.dto';
import { FacilityItemService } from '~/facility/facility-item.service';
import { SwabAreaHistoryImageService } from './swab-area-history-image.service';
import { User } from '~/auth/entities/user.entity';
import { SwabRoundService } from './swab-round.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { ProductService } from '~/product/services/product.service';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';

@Injectable()
export class SwabPlanManagerService {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly dateTransformer: DateTransformer,
    protected readonly facilityItemService: FacilityItemService,
    protected readonly productService: ProductService,
    protected readonly swabPeriodService: SwabPeriodService,
    protected readonly swabRoundService: SwabRoundService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,
    @InjectRepository(SwabEnvironment)
    protected readonly swabEnvironmentRepository: Repository<SwabEnvironment>,
    @InjectRepository(SwabAreaHistoryImage)
    protected readonly swabAreaHistoryImageRepository: Repository<SwabAreaHistoryImage>,
    protected readonly swabAreaHistoryImageService: SwabAreaHistoryImageService,
  ) {}

  async commandUpdateSwabPlanById(
    id: string,
    bodycommandUpdateSwabPlanByIdDto: BodyCommandUpdateSwabPlanByIdDto,
    recordedUser: User,
  ): Promise<void> {
    const {
      swabAreaSwabedAt,
      swabAreaTemperature,
      swabAreaHumidity,
      swabAreaNote,
      productDate: productDateString,
      productLot,
      product: connectProductDto,
      facilityItem: connectFacilityItemDto,
      swabEnvironments: upsertSwabEnvironmentDto = [],
      swabAreaHistoryImages: upsertSwabAreaHistoryImageDto = [],
    } = bodycommandUpdateSwabPlanByIdDto;

    const swabAreaHistory = await this.swabAreaHistoryRepository.findOneBy({
      id,
    });

    swabAreaHistory.recordedUser = recordedUser;

    swabAreaHistory.swabAreaSwabedAt = swabAreaSwabedAt;

    if (connectProductDto) {
      swabAreaHistory.product = this.productService.make(connectProductDto);
    }

    if (productDateString) {
      swabAreaHistory.productDate =
        this.dateTransformer.toObject(productDateString);
    }

    if (productLot) {
      swabAreaHistory.productLot = productLot;
    }

    if (connectFacilityItemDto) {
      swabAreaHistory.facilityItem = this.facilityItemService.make(
        connectFacilityItemDto,
      );
    }

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
      (upsertSwabEnvironmentData: UpsertSwabEnvironmentDto) =>
        this.swabEnvironmentRepository.create(upsertSwabEnvironmentData),
    );

    if (swabEnvironments.length) {
      swabAreaHistory.swabEnvironments = swabEnvironments;
    }

    const currentSwabAreaHistoryImageIds = [];
    const swabAreaHistoryImages = [];

    upsertSwabAreaHistoryImageDto.forEach(
      (upsertSwabAreaHistoryImageData: UpsertSwabAreaHistoryImageDto) => {
        if (upsertSwabAreaHistoryImageData.id) {
          currentSwabAreaHistoryImageIds.push(
            upsertSwabAreaHistoryImageData.id,
          );
        } else {
          if (upsertSwabAreaHistoryImageData.file) {
            upsertSwabAreaHistoryImageData.file.user = recordedUser;
          }
        }

        swabAreaHistoryImages.push(
          this.swabAreaHistoryImageService.make(upsertSwabAreaHistoryImageData),
        );
      },
    );

    const removeSwabAreaHistoryImageCondition: FindOptionsWhere<SwabAreaHistoryImage> =
      {
        swabAreaHistoryId: swabAreaHistory.id,
      };

    if (currentSwabAreaHistoryImageIds.length) {
      removeSwabAreaHistoryImageCondition.id = Not(
        In([...new Set(currentSwabAreaHistoryImageIds)]),
      );
    }

    const deletedswabAreaHistoryImages =
      await this.swabAreaHistoryImageService.find({
        where: removeSwabAreaHistoryImageCondition,
        relations: {
          file: true,
        },
      });

    if (deletedswabAreaHistoryImages.length) {
      await this.swabAreaHistoryImageService.removeMany(
        deletedswabAreaHistoryImages,
      );
    }

    if (swabAreaHistoryImages.length) {
      swabAreaHistory.swabAreaHistoryImages = swabAreaHistoryImages;
    }

    await this.swabAreaHistoryRepository.save(swabAreaHistory);
  }

  async generateSwabPlan(generateSwabPlanDto: GenerateSwabPlanDto) {
    const { fromDate, toDate, roundNumberSwabTest = '' } = generateSwabPlanDto;

    let swabRoundNumber = null;

    if (roundNumberSwabTest) {
      const swabRound = await this.swabRoundService.findOneBy({
        swabRoundNumber: roundNumberSwabTest,
      });

      if (swabRound) {
        throw new Error(
          'Swab round number already exists, use other number to generate data',
        );
      } else {
        swabRoundNumber = await this.swabRoundService.create({
          swabRoundNumber: roundNumberSwabTest,
        });
      }
    }

    const NUMBER_OF_HISTORY_DAY: number = differenceInDays(
      new Date(toDate),
      new Date(fromDate),
    );

    const bigCleaningSwabPeriodsTemplate = [
      { swabPeriodName: 'ก่อน Super Big Cleaning' },
      { swabPeriodName: 'หลัง Super Big Cleaning' },
    ];

    let result_bigClean = await this.swabPeriodService.findBy([
      { swabPeriodName: 'ก่อน Super Big Cleaning', deletedAt: null },
      { swabPeriodName: 'หลัง Super Big Cleaning', deletedAt: null },
    ]);

    const bigCleaningSwabPeriods = result_bigClean.reduce((acc, obj) => {
      let key = obj['swabPeriodName'];
      if (!acc[key]) {
        acc[key] = {};
      }
      acc[key] = obj;
      return acc;
    }, {});

    const generalSwabPeriodsTemplate = [
      { swabPeriodName: 'หลังประกอบเครื่อง' },
      { swabPeriodName: 'ก่อนล้างระหว่างงาน' },
      { swabPeriodName: 'หลังล้างระหว่างงาน' },
      { swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.' },
      { swabPeriodName: 'ก่อนล้างท้ายกะ' },
      { swabPeriodName: 'หลังล้างท้ายกะ' },
    ];

    let result_general = await this.swabPeriodService.findBy([
      { swabPeriodName: 'หลังประกอบเครื่อง', deletedAt: null },
      { swabPeriodName: 'ก่อนล้างระหว่างงาน', deletedAt: null },
      { swabPeriodName: 'หลังล้างระหว่างงาน', deletedAt: null },
      { swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.', deletedAt: null },
      { swabPeriodName: 'ก่อนล้างท้ายกะ', deletedAt: null },
      { swabPeriodName: 'หลังล้างท้ายกะ', deletedAt: null },
    ]);

    const allSwabPeriods = [...result_bigClean, ...result_general];

    const generalSwabPeriods = result_general.reduce((acc, obj) => {
      let key = obj['swabPeriodName'];
      if (!acc[key]) {
        acc[key] = {};
      }
      acc[key] = obj;
      return acc;
    }, {});

    const swabAreasTemplate = [
      {
        facilityName: 'ขึ้นรูป',
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
            swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
            subSwabAreas: [
              { swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight' },
              { swabAreaName: 'แขนชัตเตอร์' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName:
              'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
            subSwabAreas: [
              { swabAreaName: 'ชุดกดหน้าข้าว' },
              { swabAreaName: 'ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'ถาดรองเศษใต้ Portion',
            subSwabAreas: [],
          },
          {
            swabAreaName:
              'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
            subSwabAreas: [
              { swabAreaName: 'คานตู้ control หน้าเครื่อง Portion' },
              { swabAreaName: 'Cover ด้านบนเครื่อง' },
              { swabAreaName: 'ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว' },
            ],
          },
          {
            swabAreaName:
              'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
            subSwabAreas: [
              { swabAreaName: 'โครงชุดเติมข้าว ส่วน Sup Weight' },
              { swabAreaName: 'แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight' },
              { swabAreaName: 'โครงชุดแขนชัตเตอร์' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName:
              'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
            subSwabAreas: [
              { swabAreaName: 'Cover หน้าเครื่องจุดวางถาด' },
              { swabAreaName: 'ชุดกันรอบสายพานลำเลียงถาด' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName:
              'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
            subSwabAreas: [
              { swabAreaName: 'ช่องยกคานลิฟท์ด้านหลัง' },
              { swabAreaName: 'ใต้ฐานลิฟท์ยกข้าว' },
              { swabAreaName: 'แขนชุดลิฟท์ยกข้าว' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
            subSwabAreas: [
              { swabAreaName: 'Cover ใส' },
              { swabAreaName: 'Cover สแตนเลส' },
              { swabAreaName: 'Slope ท้ายเครื่อง' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          // {
          //     swabAreaName: "สายพานลำเลียงถาด",
          //     subSwabAreas: [
          //         { swabAreaName: "ตัวแผ่น" },
          //         { swabAreaName: "ตัวกั้น" },
          //     ]
          // },
          {
            swabAreaName: 'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
            subSwabAreas: [
              { swabAreaName: 'เลื่อนสายพาน' },
              { swabAreaName: 'รอยต่อโครงสร้างด้านใต้สายพาน' },
            ],
          },
          {
            swabAreaName: 'ช่องใต้เฟรมสายพาน',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName:
              'ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control',
            subSwabAreas: [
              { swabAreaName: 'ขาตั้งเครื่อง' },
              { swabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
              { swabAreaName: 'ช่องข้างขาตั้งชุด Control' },
            ],
          },
          {
            swabAreaName: 'ด้านบนตู้ Control Infeed และ สายไฟ',
            subSwabAreas: [
              { swabAreaName: 'ด้านบนตู้ Control Infeed' },
              { swabAreaName: 'สายไฟ' },
            ],
          },
          {
            swabAreaName: 'พื้นใต้เครื่อง Portion',
            subSwabAreas: [],
          },
          {
            swabAreaName: 'พื้นห้อง',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'ผนังห้อง',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'รางระบายน้ำห้อง',
            subSwabAreas: [
              { swabAreaName: 'กลางราง' },
              { swabAreaName: 'ขอบรางซ้าย' },
              { swabAreaName: 'ขอบรางขวา' },
              { swabAreaName: 'Main Hole' },
            ],
          },
          {
            swabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ',
            subSwabAreas: [
              { swabAreaName: 'แป้นกดสบู่' },
              { swabAreaName: 'อ่างล้างมือ' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'มือพนักงานช่างประกอบเครื่องหลังล้าง',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'สายลมเครื่อง Portion',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'เครื่องชั่ง Topping',
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
        ],
      },
      {
        facilityName: 'ตู้ Vac.',
        mainSwabAreas: [
          {
            swabAreaName: 'พื้นและ Slope',
            subSwabAreas: [{ swabAreaName: 'พื้น' }, { swabAreaName: 'Slope' }],
          },
        ],
      },
      {
        facilityName: 'ตู้ Steam',
        mainSwabAreas: [
          {
            swabAreaName: 'พื้นและ Slope',
            subSwabAreas: [{ swabAreaName: 'พื้น' }, { swabAreaName: 'Slope' }],
          },
        ],
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
        facilityName: 'รถเข็นกะบะ',
        mainSwabAreas: [
          {
            swabAreaName: 'ล้อรถเข็นกะบะ',
            subSwabAreas: [
              { swabAreaName: 'กันชน' },
              { swabAreaName: 'ระหว่างรอยต่อ' },
              { swabAreaName: 'โครงล้อ' },
            ],
          },
        ],
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

    const swabAreaHistories = [];
    const swabAreas = [];
    const SWAB_TEST_CODE_PREFIX = 'AI';
    let SWAB_TEST_START_NUMBER_PREFIX = 1;

    for (let index = 0; index < swabAreasTemplate.length; index++) {
      const { facilityName, mainSwabAreas = [] } = swabAreasTemplate[index];

      const fetchSwabAreas = await Promise.all(
        mainSwabAreas.map(async (mainSwabArea) => {
          const swabArea = await this.swabAreaRepository.findOne({
            where: {
              swabAreaName: mainSwabArea.swabAreaName,
              facility: {
                facilityName,
              },
            },
            relations: ['subSwabAreas'],
          });

          if (swabArea) {
            const { subSwabAreas: subSwabAreasByApi } = swabArea;
            const {
              subSwabAreas: subSwabAreasByTemplate,
              swabPeriodMapping = [],
              shiftMapping = [],
            } = mainSwabArea;

            const subSwabAreaDatas = subSwabAreasByApi.reduce((acc, obj) => {
              let key = obj['swabAreaName'];
              if (!acc[key]) {
                acc[key] = {};
              }
              acc[key] = obj;
              return acc;
            }, {});

            let subSwabAreas = [];

            for (
              let index = 0;
              index < subSwabAreasByTemplate.length;
              index++
            ) {
              const element =
                subSwabAreaDatas[subSwabAreasByTemplate[index].swabAreaName];
              subSwabAreas.push(element);
            }
            return {
              ...swabArea,
              subSwabAreas: [...subSwabAreas],
              swabPeriodMapping,
              shiftMapping,
            };
          }
        }),
      );
      swabAreas.push(fetchSwabAreas);
    }

    async function generateSwabAreaHistory(
      swabAreaDate,
      swabArea,
      swabPeriod,
      shift = null,
      createSwabTest = true,
    ) {
      const historyData = {
        swabAreaDate: format(swabAreaDate, 'yyyy-MM-dd'),
        swabAreaSwabedAt: null,
        swabAreaTemperature: null,
        swabAreaHumidity: null,
        swabAreaAtp: null,
        swabPeriod,
        swabTest: null,
        swabArea,
        swabRound: null,
        shift,
        productLot: '',
      };

      if (createSwabTest) {
        const swabTestData = SwabTest.create({
          swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${SWAB_TEST_START_NUMBER_PREFIX}${
            roundNumberSwabTest ? '/' + roundNumberSwabTest : ''
          }`,
        });

        historyData.swabTest = swabTestData;
        SWAB_TEST_START_NUMBER_PREFIX = SWAB_TEST_START_NUMBER_PREFIX + 1;
      }

      if (swabRoundNumber) {
        historyData.swabRound = swabRoundNumber;
      }

      const swabAreaHistory = SwabAreaHistory.create(historyData);

      return swabAreaHistories.push(swabAreaHistory);
    }

    async function generateHistory(
      swabAreasAll,
      currentDate = new Date(),
      dateIndex,
    ) {
      currentDate.setDate(currentDate.getDate() + dateIndex);
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
          for (let index = 0; index < swabAreasAll.length; index++) {
            const swabAreasGroupByFacility = swabAreasAll[index];

            for (
              let indexSwabArea = 0;
              indexSwabArea < swabAreasGroupByFacility.length;
              indexSwabArea++
            ) {
              const swabAreas = swabAreasGroupByFacility[indexSwabArea];
              const {
                subSwabAreas = [],
                swabPeriodMapping = [],
                shiftMapping = [],
              } = swabAreas;
              // const createSwabTest = subSwabAreas && subSwabAreas.length === 0;

              if (
                swabPeriodMapping.length &&
                !swabPeriodMapping.includes(
                  bigCleaningSwabPeriod.swabPeriodName,
                )
              ) {
                continue;
              }

              if (shiftMapping.length) {
                for (
                  let indexShift = 0;
                  indexShift < shiftMapping.length;
                  indexShift++
                ) {
                  const shift = shiftMapping[indexShift];
                  await generateSwabAreaHistory(
                    currentDate,
                    swabAreas,
                    bigCleaningSwabPeriod,
                    shift,
                    true,
                  );

                  if (subSwabAreas && subSwabAreas.length > 0) {
                    for (
                      let indexSubSwabArea = 0;
                      indexSubSwabArea < subSwabAreas.length;
                      indexSubSwabArea++
                    ) {
                      const swabArea = subSwabAreas[indexSubSwabArea];
                      await generateSwabAreaHistory(
                        currentDate,
                        swabArea,
                        bigCleaningSwabPeriod,
                        shift,
                        false,
                      );
                    }
                  }
                }
              } else {
                await generateSwabAreaHistory(
                  currentDate,
                  swabAreas,
                  bigCleaningSwabPeriod,
                  'day',
                  true,
                );

                if (subSwabAreas && subSwabAreas.length > 0) {
                  for (let index3 = 0; index3 < subSwabAreas.length; index3++) {
                    const swabArea = subSwabAreas[index3];
                    await generateSwabAreaHistory(
                      currentDate,
                      swabArea,
                      bigCleaningSwabPeriod,
                      'day',
                      false,
                    );
                  }
                }
              }
            }
          }
        }
        shiftKeys = [Object.keys(Shift)[1]];
      }

      if (dateIndex !== 0 && dateIndex === NUMBER_OF_HISTORY_DAY) {
        shiftKeys = [Object.keys(Shift)[0]];
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

          for (let index3 = 0; index3 < swabAreasAll.length; index3++) {
            const swabAreasGroupByFacility = swabAreasAll[index3];

            for (
              let index = 0;
              index < swabAreasGroupByFacility.length;
              index++
            ) {
              const swabAreas = swabAreasGroupByFacility[index];

              const { subSwabAreas = [], swabPeriodMapping = [] } = swabAreas;

              if (
                swabPeriodMapping.length &&
                !swabPeriodMapping.includes(swabPeriod.swabPeriodName)
              ) {
                continue;
              }
              // const createSwabTest = subSwabAreas && subSwabAreas.length === 0;

              await generateSwabAreaHistory(
                currentDate,
                swabAreas,
                swabPeriod,
                Shift[shiftKey],
                true,
              );

              if (subSwabAreas && subSwabAreas.length > 0) {
                for (let index4 = 0; index4 < subSwabAreas.length; index4++) {
                  const swabArea = subSwabAreas[index4];

                  await generateSwabAreaHistory(
                    currentDate,
                    swabArea,
                    swabPeriod,
                    Shift[shiftKey],
                    false,
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

  async saveSwabPlan(data: Array<String>) {
    await this.transaction.execute(async (queryRunnerManger) => {
      let result = await this.swabPeriodService.findBy([
        { swabPeriodName: 'ก่อน Super Big Cleaning', deletedAt: null },
        { swabPeriodName: 'หลัง Super Big Cleaning', deletedAt: null },
        { swabPeriodName: 'หลังประกอบเครื่อง', deletedAt: null },
        { swabPeriodName: 'ก่อนล้างระหว่างงาน', deletedAt: null },
        { swabPeriodName: 'หลังล้างระหว่างงาน', deletedAt: null },
        { swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.', deletedAt: null },
        { swabPeriodName: 'ก่อนล้างท้ายกะ', deletedAt: null },
        { swabPeriodName: 'หลังล้างท้ายกะ', deletedAt: null },
      ]);

      const swabPeriods = result.reduce((acc, obj) => {
        let key = obj['swabPeriodName'];
        if (!acc[key]) {
          acc[key] = {};
        }
        acc[key] = obj;
        return acc;
      }, {});

      for (let index = 0; index < data.length; index++) {
        const record = data[index];
        const recordData = record.split('|');

        /** index: keyData
         * 0: swabAreaDate
         * 1: shift
         * 2: swabTest.swabTestCode
         * 3: swabAreaSwabedAt
         * 4: swabArea
         * 5: swabPeriod
         * 6: swabAreaAtp
         * 7: swabEnvironments
         * 8: swabEnvironments
         * 9: swabEnvironments
         * 10: swabEnvironments
         * 11: swabEnvironments
         * 12
         * 13
         */
        const [d, m, y] = recordData[0].split('/');
        const day = d.length == 1 ? d : '0' + d;
        const month = m.length == 1 ? m : '0' + m;
        const year = parseInt('25' + y) - 543;
        const swabAreaDateData = format(
          new Date(`${year}-${month}-${day}`),
          'yyyy-MM-dd',
        );

        const shiftData = recordData[1] == 'D' ? Shift.DAY : Shift.NIGHT;

        const swabTestData = SwabTest.create({
          swabTestCode: `${recordData[2]}`,
        });

        const swabAreaSwabedAtData =
          recordData[3] == '-' ? null : recordData[3];

        const swabArea = await this.swabAreaRepository.findOne({
          where: {
            swabAreaName: recordData[4],
          },
        });

        const swabAreaData = swabArea
          ? swabArea
          : SwabArea.create({ swabAreaName: recordData[4] });

        const swabPeriodData = swabPeriods[recordData[5]];

        const swabAreaAtpData = recordData[6] == '-' ? null : recordData[6];

        const historyData = {
          swabAreaDate: swabAreaDateData,
          swabAreaSwabedAt: swabAreaSwabedAtData,
          swabAreaTemperature: null,
          swabAreaHumidity: null,
          swabAreaAtp: swabAreaAtpData,
          swabPeriod: swabPeriodData,
          swabTest: swabTestData,
          swabArea: swabAreaData,
          swabRound: null,
          shift: shiftData,
          productLot: '',
        };

        console.log(historyData);
      }
    });
  }
}
