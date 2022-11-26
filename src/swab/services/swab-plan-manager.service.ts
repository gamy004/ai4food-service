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
import { FacilityItemService } from '~/facility/services/facility-item.service';
import { SwabAreaHistoryImageService } from './swab-area-history-image.service';
import { User } from '~/auth/entities/user.entity';
import { SwabRoundService } from './swab-round.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { ProductService } from '~/product/services/product.service';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { BacteriaService } from '~/lab/services/bacteria.service';
import { BacteriaSpecieService } from '~/lab/services/bacteria-specie.service';
import { SwabAreaService } from './swab-area.service';
import { SwabRound } from '../entities/swab-round.entity';

@Injectable()
export class SwabPlanManagerService {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly dateTransformer: DateTransformer,
    protected readonly facilityItemService: FacilityItemService,
    protected readonly productService: ProductService,
    protected readonly swabPeriodService: SwabPeriodService,
    protected readonly swabRoundService: SwabRoundService,
    protected readonly swabAreaService: SwabAreaService,
    protected readonly bacteriaService: BacteriaService,
    protected readonly bacteriaSpecieService: BacteriaSpecieService,
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

      if (!swabRound) {
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
          {
            swabAreaName: 'สายพานลำเลียงถาด',
            subSwabAreas: [
              { swabAreaName: 'ตัวแผ่น' },
              { swabAreaName: 'ตัวกั้น' },
            ],
          },
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
      //     facilityName: "กล่องเครื่องมือวิศวะ",
      //     mainSwabAreas: [
      //       {
      //         swabAreaName: 'กล่องเครื่องมือวิศวะ',
      //         subSwabAreas: [
      //           { swabAreaName: 'ฝากล่อง' },
      //           { swabAreaName: 'ขอบมุม' },
      //           { swabAreaName: 'ประแจ' },
      //         ],
      //       }
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
      //             swabAreaName: "แกนสายพานซุยข้าว",
      //             subSwabAreas: [
      //                 { swabAreaName: "แกนกลาง" },
      //                 { swabAreaName: "ก้านซุย" },
      //             ]
      //         },
      //         {
      //             swabAreaName: "สายพาน และ แผ่นเพลท",
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
    data = [
      ' 2022-06-24 | D	|	AI  1	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  2	|	-	|	ขึ้นรูป | ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  3	|	-	|	ขึ้นรูป | ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  4	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  5	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  6	|	-	|	ขึ้นรูป | โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  7	|	-	|	ขึ้นรูป | Cover มอเตอร์ แกนกลางเครื่อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  8	|	-	|	ขึ้นรูป | Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  9	|	-	|	ขึ้นรูป | ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  10	|	-	|	ขึ้นรูป | Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  11	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  12	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  13	|	-	|	ขึ้นรูป | ช่องใต้เฟรมสายพาน  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  14	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  15	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  16	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  17	|	-	|	ขึ้นรูป | พื้นห้อง   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  18	|	-	|	ขึ้นรูป | ผนังห้อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  19	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  20	|	-	|	ขึ้นรูป | แป้นกดสบู่ และ อ่างล้างมือ   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  21	|	-	|	ขึ้นรูป | มือพนักงานช่างประกอบเครื่องหลังล้าง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  22	|	-	|	ขึ้นรูป | สายลมเครื่อง Portion  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  23	|	-	|	ขึ้นรูป | เครื่องชั่ง Topping  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  24	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  25	|	-	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  26	|	-	|	ตู้ Steam | พื้นและ Slope   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | D	|	AI  27	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  28	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	AI  29	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  30	|	14.34	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลัง Super Big Cleaning	|	64 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  31	|	14.35	|	ขึ้นรูป | ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์ 	|	หลัง Super Big Cleaning	|	32 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  32	|	19.16	|	ขึ้นรูป | ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด  	|	หลัง Super Big Cleaning	|	976 RLU ,  247 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  33	|	14.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลัง Super Big Cleaning	|	1269 RLU , 18 RLU	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  34	|	19.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลัง Super Big Cleaning	|	59 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  35	|	19.09	|	ขึ้นรูป | โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์ 	|	หลัง Super Big Cleaning	|	175 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  36	|	15.03	|	ขึ้นรูป | Cover มอเตอร์ แกนกลางเครื่อง 	|	หลัง Super Big Cleaning	|	18 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  37	|	19.10	|	ขึ้นรูป | Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด  	|	หลัง Super Big Cleaning	|	29 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  38	|	19.06	|	ขึ้นรูป | ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว 	|	หลัง Super Big Cleaning	|	25 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  39	|	15.07	|	ขึ้นรูป | Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง  	|	หลัง Super Big Cleaning	|	55 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  40	|	15.03	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลัง Super Big Cleaning	|	64 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  41	|	19.07	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลัง Super Big Cleaning	|	369 RLU , 66 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  42	|	19.15	|	ขึ้นรูป | ช่องใต้เฟรมสายพาน  	|	หลัง Super Big Cleaning	|	28 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  43	|	19.12	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลัง Super Big Cleaning	|	519 RLU ,  23 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  44	|	19.10	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	หลัง Super Big Cleaning	|	28 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  45	|	19.11	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลัง Super Big Cleaning	|	1351 RLU ,  196 RLU	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  46	|	18.27	|	ขึ้นรูป | พื้นห้อง   	|	หลัง Super Big Cleaning	|	185 RLU	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  47	|	18.23	|	ขึ้นรูป | ผนังห้อง  	|	หลัง Super Big Cleaning	|	7 RLU	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  48	|	18.30	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลัง Super Big Cleaning	|	443 RLU , 50 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  49	|	18.22	|	ขึ้นรูป | แป้นกดสบู่ และ อ่างล้างมือ   	|	หลัง Super Big Cleaning	|	254 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  50	|	20.55	|	ขึ้นรูป | มือพนักงานช่างประกอบเครื่องหลังล้าง  	|	หลัง Super Big Cleaning	|	36 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  51	|	18.25	|	ขึ้นรูป | สายลมเครื่อง Portion 	|	หลัง Super Big Cleaning	|	58 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	มีน้ำขัง	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  52	|	18.26	|	ขึ้นรูป | เครื่องชั่ง Topping  	|	หลัง Super Big Cleaning	|	8 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  53	|	18.21	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลัง Super Big Cleaning	|	7 RLU	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  54	|	17.33	|	ตู้ Vac. | พื้นและ Slope   	|	หลัง Super Big Cleaning	|	35 RLU	|	มีความชื้น	|	มีความชื้น	|	มีรอยแตก	|	มีน้ำขัง	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  55	|	17.32	|	ตู้ Steam | พื้นและ Slope  	|	หลัง Super Big Cleaning	|	1039 RLU ,  96 RLU	|	มีความชื้น	|	มีความชื้น	|	มีน้ำขัง	|	มีรอยแตก	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  56	|	18.36	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลัง Super Big Cleaning	|	380 RLU , 55 RLU	|	มีความชื้น	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  57	|	17.34	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลัง Super Big Cleaning	|	9 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  58	|	17.35	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลัง Super Big Cleaning	|	9 RLU	|	มีความชื้น	|	มีผิวขรุขระ	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  59	|	20.51	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  60	|	20.21	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  61	|	20.50	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  62	|	20.48	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  63	|	20.47	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  64	|	20.22	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  65	|	20.45	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีรอยแยก	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  66	|	20.20	|	ขึ้นรูป | พื้นใต้เครื่อง Portion   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  67	|	20.18	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  68	|	20.19	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	มีผิวขรุขระ	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  69	|	20.13	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  70	|	20.12	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  71	|	20.14	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีเกลียว	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  72	|	20.16	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีผิวขรุขระ	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  73	|	20.53	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  74	|	0.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  75	|	0.08	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  76	|	0.09	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  77	|	0.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  78	|	0.10	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  79	|	0.07	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  80	|	0.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  81	|	0.08	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  82	|	0.13	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  83	|	0.14	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  84	|	0.05	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  85	|	0.05	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  86	|	0.13	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  87	|	0.06	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  88	|	0.07	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  89	|	0.23	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  90	|	0.22	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  91	|	0.24	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  92	|	0.24	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  93	|	0.23	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  94	|	0.24	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  95	|	0.22	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  96	|	0.25	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  97	|	0.25	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  98	|	0.17	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  99	|	0.18	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  100	|	0.18	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  101	|	0.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  102	|	0.19	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  103	|	0.20	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  104	|	4.22	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  105	|	4.17	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  106	|	4.20	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  107	|	4.18	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  108	|	4.19	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีรอยแยก	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  109	|	4.23	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  110	|	4.18	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  111	|	4.24	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  112	|	4.26	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  113	|	4.28	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  114	|	4.12	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  115	|	4.11	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  116	|	4.26	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  117	|	4.14	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  118	|	4.15	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  119	|	5.41	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  120	|	5.42	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  121	|	5.42	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  122	|	5.44	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  123	|	5.44	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  124	|	5.46	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  125	|	5.41	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  126	|	5.46	|	ขึ้นรูป | พื้นใต้เครื่อง Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  127	|	5.47	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  128	|	5.50	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  129	|	5.00	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  130	|	5.01	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  131	|	5.48	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua,	',
      '	2022-06-24 | N	|	AI  132	|	5.02	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  133	|	5.02	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  134	|	7.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  135	|	7.58	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  136	|	7.55	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  137	|	7.52	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  138	|	7.59	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  139	|	7.54	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  140	|	7.56	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  141	|	7.51	|	ขึ้นรูป | พื้นใต้เครื่อง Portion    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  142	|	7.49	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  143	|	8.02	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  144	|	5.32	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  145	|	5.33	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	AI  146	|	5.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  147	|	5.35	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	AI  148	|	5.35	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  149	|	8.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  150	|	8.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  151	|	8.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  152	|	8.46	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  153	|	8.48	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  154	|	8.42	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  155	|	8.41	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  156	|	8.40	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  157	|	8.49	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  158	|	8.55	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  159	|	8.52	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | D	|	AI  160	|	8.53	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | D	|	AI  161	|	8.44	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  162	|	8.50	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  163	|	8.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  164	|	10.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  165	|	10.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  166	|	10.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  167	|	10.46	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  168	|	10.48	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  169	|	10.42	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีคราบสกปรก	|	มีความชื้น	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  170	|	10.41	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  171	|	10.40	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  172	|	10.49	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  173	|	10.55	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  174	|	10.52	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีรอยแตก	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  175	|	10.53	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  176	|	10.44	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  177	|	10.50	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  178	|	10.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  179	|	13.07	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  180	|	13.10	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  181	|	13.09	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  182	|	13.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  183	|	13.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  184	|	13.08	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีคราบสกปรก	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  185	|	13.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  186	|	13.12	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  187	|	13.20	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  188	|	13.22	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  189	|	13.16	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีรอยแตก	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  190	|	13.15	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | D	|	AI  191	|	13.14	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  192	|	13.26	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  193	|	13.25	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  194	|	17.12	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  195	|	17.11	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  196	|	17.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  197	|	17.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  198	|	17.13	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  199	|	17.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  200	|	17.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  201	|	17.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  202	|	17.15	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | D	|	AI  203	|	17.16	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  204	|	17.13	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  205	|	17.15	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  206	|	17.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  207	|	17.10	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  208	|	17.11	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	AI  209	|	18.30	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  210	|	18.31	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  211	|	18.31	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  212	|	18.32	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  213	|	18.32	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  214	|	18.31	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  215	|	18.33	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  216	|	18.30	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  217	|	18.34	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  218	|	18.34	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  219	|	17.12	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  220	|	17.13	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีผิวขรุขระ	|	มีรอยแตก	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  221	|	17.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  222	|	17.10	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	มีเศษอาหาร	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  223	|	17.11	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	มีเศษอาหาร	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  224	|	18.57	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  225	|	19.06	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  226	|	19.08	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  227	|	19.04	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  228	|	19.07	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  229	|	19.05	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  230	|	19.05	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  231	|	19.07	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  232	|	19.10	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  233	|	18.58	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | D	|	AI  234	|	18.39	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  235	|	18.39	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  236	|	18.38	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  237	|	18.37	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	AI  238	|	18.37	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  239	|	19.20	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  240	|	19.15	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  241	|	19.16	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  242	|	19.16	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  243	|	19.18	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  244	|	19.17	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  245	|	19.19	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  246	|	19.21	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  247	|	19.27	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  248	|	19.22	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  249	|	18.40	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  250	|	18.42	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  251	|	18.52	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  252	|	18.53	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  253	|	18.54	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  254	|	23.21	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  255	|	23.30	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  256	|	23.30	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  257	|	23.29	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  258	|	23.27	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  259	|	23.30	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  260	|	23.29	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  261	|	23.29	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  262	|	23.01	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  263	|	22.31	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  264	|	22.23	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  265	|	22.22	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  266	|	22.24	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  267	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	AI  268	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	AI  269	|	23.39	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  270	|	23.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  271	|	23.51	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	AI  272	|	23.48	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  273	|	23.47	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  274	|	23.49	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  275	|	23.50	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  276	|	23.49	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  277	|	23.57	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  278	|	22.37	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  279	|	23.08	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  280	|	23.07	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  281	|	23.08	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  282	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	AI  283	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	AI  284	|	5.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  285	|	5.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  286	|	5.12	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	AI  287	|	5.11	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  288	|	5.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  289	|	5.06	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  290	|	5.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  291	|	5.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	AI  292	|	5.15	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  293	|	3.26	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  294	|	3.22	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  295	|	3.18	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีรอยแตก	|	-	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  296	|	3.21	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  297	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	AI  298	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	AI  299	|	5.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  300	|	5.14	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  301	|	5.15	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	AI  302	|	5.13	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  303	|	5.13	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  304	|	5.15	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  305	|	5.14	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  306	|	5.14	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  307	|	5.17	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  308	|	4.25	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  309	|	4.22	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  310	|	4.23	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  311	|	4.23	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  312	|	4.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  313	|	4.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  314	|	5.30	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  315	|	5.51	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  316	|	5.52	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	AI  317	|	5.50	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  318	|	5.48	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  319	|	5.49	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  320	|	5.51	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  321	|	5.49	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  322	|	6.00	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  323	|	5.45	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  324	|	5.38	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  325	|	5.37	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	AI  326	|	5.36	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  327	|	5.29	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	AI  328	|	5.28	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  329	|	9.05	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  330	|	9.03	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  331	|	9.03	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  332	|	9.04	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  333	|	9.04	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  334	|	9.01	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  335	|	9.00	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  336	|	9.01	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  337	|	9.06	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  338	|	9.09	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  339	|	8.53	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  340	|	8.55	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  341	|	8.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  342	|	8.54	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  343	|	8.55	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  344	|	12.02	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  345	|	12.01	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  346	|	12.00	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  347	|	12.02	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  348	|	12.03	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  349	|	12.00	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  350	|	12.02	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  351	|	12.04	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  352	|	12.04	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  353	|	12.04	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  354	|	11.54	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  355	|	11.55	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  356	|	11.54	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  357	|	11.53	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  358	|	11.54	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  359	|	12.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  360	|	12.46	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  361	|	12.45	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  362	|	12.44	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  363	|	12.45	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  364	|	12.46	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  365	|	12.47	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  366	|	12.46	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  367	|	12.47	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  368	|	12.52	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  369	|	12.50	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  370	|	12.50	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  371	|	12.50	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  372	|	12.49	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  373	|	12.49	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  374	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  375	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  376	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  377	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  378	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  379	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  380	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  381	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  382	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  383	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  384	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  385	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  386	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  387	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  388	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	AI  389	|	17.37	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  390	|	17.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  391	|	17.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  392	|	17.37	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  393	|	17.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  394	|	17.35	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  395	|	17.40	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  396	|	17.36	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  397	|	17.41	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  398	|	17.43	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  399	|	17.41	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  400	|	17.42	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  401	|	17.43	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  402	|	17.42	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  403	|	17.47	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  404	|	18.19	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  405	|	18.20	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  406	|	18.18	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  407	|	19.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  408	|	18.20	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  409	|	18.23	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  410	|	18.21	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  411	|	18.22	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  412	|	17.49	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  413	|	18.30	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  414	|	18.46	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  415	|	18.48	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	AI  416	|	18.49	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  417	|	18.47	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	AI  418	|	18.48	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  419	|	19.00	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  420	|	19.00	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  421	|	19.01	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  422	|	19.05	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  423	|	19.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  424	|	19.10	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  425	|	19.06	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  426	|	19.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  427	|	19.07	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  428	|	19.02	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  429	|	18.00	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  430	|	18.00	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  431	|	18.02	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  432	|	18.01	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  433	|	18.01	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  434	|	22.58	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  435	|	23.03	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  436	|	23.01	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  437	|	23.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  438	|	23.01	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  439	|	22.59	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  440	|	23.01	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  441	|	23.02	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  442	|	23.03	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  443	|	22.16	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  444	|	22.07	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  445	|	22.06	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  446	|	22.09	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  447	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  448	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  449	|	23.21	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  450	|	23.29	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  451	|	23.30	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  452	|	23.32	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  453	|	23.31	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  454	|	23.31	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  455	|	23.31	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  456	|	23.31	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  457	|	23.32	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  458	|	22.26	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  459	|	22.11	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  460	|	22.12	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  461	|	22.13	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  462	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  463	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  464	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  465	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  466	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  467	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  468	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  469	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  470	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  471	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  472	|	2.19	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  473	|	2.10	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  474	|	2.08	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีคราบสกปรก	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  475	|	2.07	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  476	|	2.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  477	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  478	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	AI  479	|	4.27	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  480	|	4.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  481	|	4.24	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-26 | N	|	AI  482	|	4.26	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  483	|	4.29	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  484	|	4.26	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  485	|	4.28	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  486	|	4.25	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  487	|	4.30	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  488	|	4.48	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  489	|	4.26	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  490	|	3.36	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  491	|	4.25	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  492	|	2.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  493	|	2.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  494	|	5.25	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  495	|	5.33	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  496	|	5.29	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-26 | N	|	AI  497	|	5.29	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  498	|	5.28	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  499	|	5.43	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  500	|	5.27	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  501	|	5.44	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  502	|	6.00	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  503	|	4.53	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  504	|	5.18	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  505	|	4.02	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	AI  506	|	5.17	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  507	|	5.19	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	AI  508	|	5.18	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  509	|	5.34	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  510	|	5.35	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  511	|	5.37	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  512	|	5.36	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  513	|	5.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  514	|	5.43	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  515	|	5.36	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  516	|	5.44	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  517	|	6.00	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  518	|	5.47	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  519	|	5.14	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  520	|	5.16	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  521	|	5.14	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  522	|	5.13	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  523	|	5.12	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  524	|	12.12	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  525	|	12.13	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  526	|	12.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  527	|	12.11	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  528	|	12.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  529	|	12.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  530	|	12.13	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  531	|	12.14	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  532	|	12.19	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  533	|	12.20	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  534	|	12.16	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  535	|	12.17	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  536	|	12.18	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  537	|	12.15	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  538	|	12.16	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	มีเศษอาหาร	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  539	|	12.31	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  540	|	12.32	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  541	|	12.34	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  542	|	12.30	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  543	|	12.33	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  544	|	12.34	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  545	|	12.33	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  546	|	12.34	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  547	|	12.36	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  548	|	12.40	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  549	|	-	|	ตู้ Vac. | พื้นและ Slope   	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  550	|	-	|	ตู้ Steam | พื้นและ Slope   	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  551	|	12.37	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  552	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  553	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  554	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  555	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  556	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  557	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  558	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  559	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  560	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  561	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  562	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  563	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  564	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  565	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  566	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  567	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  568	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	AI  569	|	15.18	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  570	|	15.19	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  571	|	15.19	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  572	|	15.20	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  573	|	15.22	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  574	|	15.21	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  575	|	15.21	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  576	|	15.20	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  577	|	15.23	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  578	|	15.25	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  579	|	13.58	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  580	|	13.59	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | D	|	AI  581	|	14.00	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  582	|	13.58	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  583	|	13.57	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  584	|	16.03	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  585	|	15.54	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  586	|	15.55	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  587	|	15.51	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  588	|	15.53	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  589	|	15.55	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  590	|	15.53	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  591	|	16.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  592	|	16.04	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  593	|	16.04	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  594	|	15.14	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  595	|	15.14	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  596	|	15.15	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua	',
      '	2022-06-27 | D	|	AI  597	|	15.12	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	AI  598	|	15.12	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  599	|	16.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีเกลียว	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  600	|	16.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  601	|	16.07	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  602	|	16.07	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  603	|	16.08	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  604	|	16.05	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  605	|	16.05	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  606	|	16.08	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  607	|	16.20	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  608	|	16.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  609	|	15.28	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  610	|	15.28	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  611	|	15.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  612	|	16.11	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  613	|	16.11	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  614	|	24.00	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  615	|	24.01	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  616	|	24.04	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  617	|	24.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  618	|	24.02	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  619	|	24.03	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  620	|	24.03	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  621	|	24.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  622	|	24.04	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  623	|	22.33	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  624	|	22.29	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  625	|	22.30	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  626	|	22.31	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  627	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  628	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  629	|	24.23	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  630	|	24.25	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  631	|	24.26	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  632	|	24.24	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  633	|	24.23	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  634	|	24.25	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  635	|	24.24	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  636	|	24.25	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  637	|	24.27	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  638	|	22.54	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  639	|	23.00	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  640	|	22.59	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  641	|	22.57	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  642	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  643	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  644	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  645	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  646	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  647	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  648	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  649	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  650	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  651	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  652	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  653	|	2.34	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  654	|	2.36	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  655	|	2.31	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  656	|	2.34	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  657	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  658	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	AI  659	|	4.45	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  660	|	4.57	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  661	|	4.56	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  662	|	4.56	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  663	|	4.58	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  664	|	4.46	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  665	|	4.57	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  666	|	4.55	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  667	|	4.59	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  668	|	5.00	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  669	|	5.06	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  670	|	5.05	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  671	|	5.08	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  672	|	2.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  673	|	2.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  674	|	5.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  675	|	5.58	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  676	|	5.58	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  677	|	5.57	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  678	|	5.59	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  679	|	5.57	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  680	|	5.58	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  681	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  682	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  683	|	5.54	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  684	|	5.49	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  685	|	5.50	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	AI  686	|	5.50	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  687	|	5.49	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	AI  688	|	5.49	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  689	|	6.01	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  690	|	6.00	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  691	|	6.01	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  692	|	5.59	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  693	|	6.02	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  694	|	6.01	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  695	|	6.00	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  696	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  697	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  698	|	5.54	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  699	|	5.52	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  700	|	5.53	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | D	|	AI  701	|	5.53	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  702	|	5.51	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  703	|	5.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  704	|	12.14	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  705	|	12.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  706	|	12.20	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  707	|	12.23	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  708	|	12.25	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  709	|	12.16	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีเกลียว	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  710	|	12.43	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  711	|	12.22	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  712	|	12.28	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  713	|	12.12	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  714	|	10.30	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  715	|	10.31	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	AI  716	|	10.34	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  717	|	10.33	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  718	|	10.28	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  719	|	12.53	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  720	|	12.54	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	AI  721	|	12.52	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  722	|	12.56	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  723	|	12.55	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  724	|	12.51	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  725	|	13.03	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  726	|	12.57	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  727	|	13.02	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  728	|	12.59	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  729	|	10.41	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  730	|	10.40	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  731	|	10.45	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  732	|	10.42	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  733	|	10.43	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  734	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  735	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  736	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  737	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  738	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  739	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  740	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  741	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  742	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  743	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	AI  744	|	15.03	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  745	|	15.02	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	AI  746	|	15.02	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | D	|	AI  747	|	15.01	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  748	|	15.01	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  749	|	16.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  750	|	16.55	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  751	|	16.53	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  752	|	16.55	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  753	|	16.54	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  754	|	16.56	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  755	|	16.57	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  756	|	16.56	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  757	|	16.58	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  758	|	16.59	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  759	|	15.00	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  760	|	15.03	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  761	|	15.02	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  762	|	14.59	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  763	|	15.01	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  764	|	18.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  765	|	18.58	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  766	|	18.55	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  767	|	18.57	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  768	|	18.59	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  769	|	18.59	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  770	|	18.55	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  771	|	18.58	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	AI  772	|	18.56	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  773	|	19.00	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  774	|	17.11	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  775	|	17.08	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  776	|	17.11	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  777	|	17.05	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	AI  778	|	17.06	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  779	|	19.12	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  780	|	19.13	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  781	|	19.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  782	|	19.11	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  783	|	19.15	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  784	|	19.14	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  785	|	19.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  786	|	19.15	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  787	|	19.16	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  788	|	19.17	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  789	|	17.17	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  790	|	17.17	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  791	|	17.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  792	|	17.16	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  793	|	17.15	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  794	|	23.38	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  795	|	23.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  796	|	23.41	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-28 | N	|	AI  797	|	23.40	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  798	|	23.39	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  799	|	23.41	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  800	|	23.40	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  801	|	23.41	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  802	|	23.42	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  803	|	22.20	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  804	|	22.16	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  805	|	22.15	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  806	|	22.18	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  807	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  808	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  809	|	23.52	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  810	|	24.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  811	|	24.08	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  812	|	24.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  813	|	24.09	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  814	|	24.08	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  815	|	24.08	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  816	|	24.08	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  817	|	24.06	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  818	|	22.44	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  819	|	22.45	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  820	|	22.34	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  821	|	22.36	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  822	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  823	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  824	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  825	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  826	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  827	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  828	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  829	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  830	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  831	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  832	|	4.00	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  833	|	3.06	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  834	|	3.04	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีคราบสกปรก	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  835	|	3.01	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  836	|	3.32	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  837	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  838	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  839	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	AI  840	|	5.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  841	|	5.27	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  842	|	5.26	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  843	|	5.27	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  844	|	5.26	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  845	|	5.26	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  846	|	5.26	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  847	|	5.29	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  848	|	5.00	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  849	|	4.49	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  850	|	4.51	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  851	|	4.28	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  852	|	2.32	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  853	|	2.31	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  854	|	6.24	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  855	|	6.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  856	|	6.25	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-28 | N	|	AI  857	|	6.24	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  858	|	6.25	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  859	|	6.26	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  860	|	6.25	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  861	|	6.26	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  862	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  863	|	5.49	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  864	|	5.40	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  865	|	5.35	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	AI  866	|	5.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  867	|	5.38	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	AI  868	|	5.37	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  869	|	6.38	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  870	|	6.39	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  871	|	6.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  872	|	6.37	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  873	|	6.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  874	|	6.38	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  875	|	6.38	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  876	|	6.37	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  877	|	6.42	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  878	|	5.49	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  879	|	5.41	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  880	|	5.36	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  881	|	5.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  882	|	5.38	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  883	|	5.38	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  884	|	11.11	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  885	|	11.12	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  886	|	11.12	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  887	|	11.10	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  888	|	11.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  889	|	11.09	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  890	|	11.09	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  891	|	11.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  892	|	11.13	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  893	|	11.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  894	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  895	|	-	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  896	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  897	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  898	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  899	|	11.27	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  900	|	11.24	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  901	|	11.26	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  902	|	11.25	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  903	|	11.23	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  904	|	11.25	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  905	|	11.24	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  906	|	11.23	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  907	|	11.29	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  908	|	11.28	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  909	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  910	|	-	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  911	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  912	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  913	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  914	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  915	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  916	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  917	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  918	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  919	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  920	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  921	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  922	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  923	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  924	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  925	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  926	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  927	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  928	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	AI  929	|	15.08	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  930	|	15.10	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  931	|	15.11	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  932	|	15.06	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  933	|	15.09	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  934	|	15.12	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  935	|	15.07	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  936	|	15.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  937	|	15.13	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  938	|	15.14	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  939	|	15.02	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  940	|	15.00	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  941	|	15.04	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  942	|	15.01	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  943	|	15.02	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  944	|	16.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  945	|	16.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  946	|	16.44	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  947	|	16.42	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  948	|	16.45	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  949	|	16.42	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  950	|	16.46	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  951	|	16.47	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  952	|	16.48	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  953	|	16.49	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  954	|	16.28	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  955	|	16.31	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	AI  956	|	16.32	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  957	|	16.26	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	AI  958	|	16.27	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  959	|	16.52	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  960	|	16.55	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  961	|	16.53	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  962	|	16.55	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  963	|	16.52	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  964	|	16.54	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  965	|	16.54	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  966	|	16.54	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  967	|	16.56	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  968	|	16.50	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  969	|	16.33	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  970	|	16.37	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  971	|	16.38	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  972	|	16.35	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  973	|	16.37	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  974	|	24.36	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   |	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  975	|	24.37	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  976	|	24.38	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  977	|	24.36	| ขึ้นรูป |	สายพานลำเลียงถาด  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  978	|	24.35	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  979	|	24.37	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  980	|	24.34	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  981	|	24.38	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  982	|	24.40	|	ขึ้นรูป | รางระบายน้ำห้อง  |	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  983	|	21.55	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  |	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  984	|	21.51	|	ตู้ Vac. | พื้นและ Slope  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  985	|	21.49	|	ตู้ Steam | พื้นและ Slope  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  986	|	21.47	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  987	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  |	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  988	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  |	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  989	|	1.15	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  990	|	1.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  991	|	1.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  992	|	1.11	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  993	|	1.10	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  994	|	1.10	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  995	|	1.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  996	|	1.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  997	|	1.12	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  998	|	22.08	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  999	|	22.06	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1000	|	22.03	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1001	|	22.04	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1002	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1003	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1004	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1005	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1006	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1007	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1008	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1009	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1010	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1011	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1012	|	2.34	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1013	|	2.29	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1014	|	2.30	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1015	|	2.22	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1016	|	2.35	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1017	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1018	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1019	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1020	|	4.22	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1021	|	4.21	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1022	|	4.22	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1023	|	4.21	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1024	|	4.22	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1025	|	4.20	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1026	|	4.21	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1027	|	4.23	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1028	|	4.28	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1029	|	3.28	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1030	|	3.27	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua	',
      '	2022-06-29 | N	|	AI  1031	|	3.26	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1032	|	4.39	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1033	|	4.39	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1034	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	AI  1035	|	5.10	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1036	|	5.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1037	|	5.08	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1038	|	5.09	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1039	|	5.09	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1040	|	5.09	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1041	|	5.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1042	|	5.18	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1043	|	5.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1044	|	3.46	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1045	|	3.45	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | N	|	AI  1046	|	3.48	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-29 | N	|	AI  1047	|	5.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	AI  1048	|	5.21	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1049	|	5.13	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1050	|	5.12	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1051	|	5.11	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1052	|	5.13	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1053	|	5.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1054	|	5.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1055	|	5.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1056	|	5.12	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1057	|	5.18	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1058	|	5.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1059	|	5.20	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1060	|	5.21	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1061	|	5.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1062	|	5.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1063	|	5.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1064	|	12.03	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1065	|	12.06	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1066	|	12.07	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1067	|	12.07	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1068	|	12.05	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1069	|	12.07	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1070	|	12.05	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1071	|	12.06	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1072	|	12.08	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1073	|	12.10	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1074	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1075	|	-	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1076	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1077	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1078	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1079	|	12.28	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1080	|	12.28	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1081	|	12.27	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1082	|	12.26	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1083	|	12.29	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1084	|	12.27	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1085	|	12.29	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1086	|	12.28	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1087	|	12.29	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1088	|	12.31	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1089	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1090	|	-	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1091	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1092	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1093	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1094	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1095	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1096	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1097	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1098	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1099	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1100	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1101	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1102	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1103	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1104	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1105	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1106	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1107	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1108	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	AI  1109	|	16.42	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1110	|	16.42	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1111	|	16.44	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1112	|	16.44	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1113	|	16.45	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1114	|	16.45	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1115	|	16.43	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1116	|	16.43	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1117	|	16.46	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1118	|	16.47	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1119	|	16.12	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1120	|	16.12	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1121	|	16.16	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1122	|	16.15	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1123	|	16.13	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1124	|	17.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1125	|	17.31	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1126	|	17.32	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1127	|	17.30	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1128	|	17.33	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1129	|	17.32	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1130	|	17.30	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1131	|	17.33	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1132	|	17.37	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1133	|	17.34	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1134	|	16.56	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | D	|	AI  1135	|	16.53	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1136	|	16.52	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1137	|	16.53	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	AI  1138	|	16.53	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | N	|	AI  1139	|	17.53	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1140	|	17.54	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1141	|	17.54	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   |	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1142	|	17.53	| ขึ้นรูป |	สายพานลำเลียงถาด   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1143	|	17.54	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1144	|	17.55	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1145	|	17.55	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1146	|	17.55	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1147	|	17.58	|	ขึ้นรูป | รางระบายน้ำห้อง   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1148	|	17.56	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   |	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1149	|	17.03	|	ตู้ Vac. | พื้นและ Slope   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1150	|	17.04	|	ตู้ Steam | พื้นและ Slope   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1151	|	17.03	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1152	|	17.04	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1153	|	17.04	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1154	|	23.11	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1155	|	23.11	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1156	|	23.11	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1157	|	23.10	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1158	|	23.10	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1159	|	23.09	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1160	|	23.09	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1161	|	23.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1162	|	23.12	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1163	|	23.14	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1164	|	22.50	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1165	|	22.50	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1166	|	23.13	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1167	|	22.51	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1168	|	22.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1169	|	23.25	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1170	|	23.36	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1171	|	23.35	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1172	|	23.35	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1173	|	23.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1174	|	23.36	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1175	|	23.35	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1176	|	23.36	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1177	|	23.24	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1178	|	23.38	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1179	|	23.18	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1180	|	23.18	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1181	|	23.37	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1182	|	23.17	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1183	|	23.17	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1184	|	3.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1185	|	3.11	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1186	|	3.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1187	|	3.10	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1188	|	3.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1189	|	3.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1190	|	3.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1191	|	3.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1192	|	3.14	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1193	|	3.16	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1194	|	2.58	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1195	|	2.58	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1196	|	2.59	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1197	|	2.00	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1198	|	2.00	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1199	|	4.59	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1200	|	5.00	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1201	|	4.59	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1202	|	5.00	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1203	|	5.02	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1204	|	5.02	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1205	|	5.01	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1206	|	5.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1207	|	5.04	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1208	|	4.42	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1209	|	4.40	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1210	|	4.40	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1211	|	5.06	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1212	|	4.39	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1213	|	4.39	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1214	|	5.29	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1215	|	5.31	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1216	|	5.29	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1217	|	5.29	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1218	|	5.32	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1219	|	5.30	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1220	|	5.30	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1221	|	5.30	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1222	|	5.36	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1223	|	5.37	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1224	|	5.27	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1225	|	5.27	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	AI  1226	|	5.34	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1227	|	5.26	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	AI  1228	|	5.26	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1229	|	8.42	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1230	|	8.42	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1231	|	8.43	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1232	|	8.42	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1233	|	8.43	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1234	|	8.44	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1235	|	8.43	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1236	|	8.44	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1237	|	8.45	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1238	|	8.45	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1239	|	8.56	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	AI  1240	|	8.56	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1241	|	8.56	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1242	|	8.55	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1243	|	8.55	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1244	|	12.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1245	|	12.08	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1246	|	12.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1247	|	12.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1248	|	12.08	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1249	|	12.10	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1250	|	12.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1251	|	12.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1252	|	12.09	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1253	|	12.13	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1254	|	12.13	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1255	|	12.13	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	AI  1256	|	12.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1257	|	12.12	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1258	|	12.12	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1259	|	12.17	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1260	|	12.18	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1261	|	12.15	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1262	|	12.18	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1263	|	12.17	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	AI  1264	|	12.15	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	AI  1265	|	12.15	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1266	|	12.16	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1267	|	12.16	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1268	|	12.22	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1269	|	12.21	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1270	|	12.21	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-07-01 | D	|	AI  1271	|	12.21	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1272	|	12.20	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1273	|	12.20	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1274	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1275	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1276	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1277	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1278	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1279	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1280	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1281	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1282	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1283	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1284	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1285	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1286	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1287	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1288	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	AI  1289	|	15.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1290	|	15.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1291	|	15.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1292	|	15.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1293	|	15.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1294	|	15.08	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1295	|	15.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1296	|	15.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1297	|	15.11	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1298	|	15.32	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1299	|	14.21	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1300	|	14.22	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1301	|	14.22	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1302	|	14.20	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1303	|	14.20	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1304	|	15.36	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1305	|	15.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1306	|	15.37	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1307	|	15.37	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1308	|	15.39	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1309	|	15.38	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1310	|	15.38	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1311	|	15.38	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1312	|	15.41	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1313	|	15.43	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1314	|	15.32	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	AI  1315	|	15.33	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1316	|	15.32	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1317	|	15.31	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	AI  1318	|	15.31	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
    ];

    await this.transaction.execute(async (queryRunnerManger) => {
      const whereSwabRound: FindOptionsWhere<SwabRound> = {swabRoundNumber: '1'};
      
      let targetSwabRound = await this.swabRoundService.findOne({
        where: whereSwabRound,
        transaction: true
      });

      if (!targetSwabRound) {
        targetSwabRound = await queryRunnerManger.save(
          this.swabRoundService.make({
            swabRoundNumber: whereSwabRound.swabRoundNumber as string
          })
        );
      }

      let result_swabPeriod = await this.swabPeriodService.find({
        where: [
          { swabPeriodName: 'ก่อน Super Big Cleaning', deletedAt: null },
          { swabPeriodName: 'หลัง Super Big Cleaning', deletedAt: null },
          { swabPeriodName: 'หลังประกอบเครื่อง', deletedAt: null },
          { swabPeriodName: 'ก่อนล้างระหว่างงาน', deletedAt: null },
          { swabPeriodName: 'หลังล้างระหว่างงาน', deletedAt: null },
          { swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.', deletedAt: null },
          { swabPeriodName: 'ก่อนล้างท้ายกะ', deletedAt: null },
          { swabPeriodName: 'หลังล้างท้ายกะ', deletedAt: null },
        ],
        transaction: true,
      });

      let result_facilityItem = await this.facilityItemService.find({
        where: [
          { facilityItemName: 'ไลน์4 ขึ้นรูป2', deletedAt: null },
          { facilityItemName: 'เครื่องซุยข้าว Aiho No.2', deletedAt: null },
          { facilityItemName: 'ตู้ Steam โซนสุก No.4', deletedAt: null },
          { facilityItemName: 'ตู้ Vac. โซนสุก No.2', deletedAt: null },
          { facilityItemName: 'รถเข็นกะบะ โซนสุก', deletedAt: null },
          { facilityItemName: 'กล่องเครื่องมือวิศวะ โซนสุก', deletedAt: null },
        ],
        transaction: true,
      });

      const facilityItem = result_facilityItem.reduce((acc, obj) => {
        let key = obj['facilityItemName'];
        if (!acc[key]) {
          acc[key] = {};
        }
        acc[key] = obj;
        return acc;
      }, {});

      const swabPeriods = result_swabPeriod.reduce((acc, obj) => {
        let key = obj['swabPeriodName'];
        if (!acc[key]) {
          acc[key] = {};
        }
        acc[key] = obj;
        return acc;
      }, {});

      let result_swabEnvironment = await this.swabEnvironmentRepository.find({
        transaction: true,
      });

      const swabEnvironments = result_swabEnvironment.reduce((acc, obj) => {
        let key = obj['swabEnvironmentName'];
        if (!acc[key]) {
          acc[key] = {};
        }
        acc[key] = obj;
        return acc;
      }, {});

      const bacteria = await this.bacteriaService.findOne({
        where: {
          bacteriaName: 'Listeria',
        },
        transaction: true,
      });

      console.log(data);

      for (let index = 0; index < data.length; index++) {
        const record = data[index];
        const recordData = record.split('|');

        /** index: keyData
         * 0: swabAreaDate
         * 1: shift
         * 2: swabTest.swabTestCode
         * 3: swabAreaSwabedAt
         * 4: facilityItem
         * 5: swabArea
         * 6: swabPeriod
         * 7: swabAreaAtp
         * 8: swabEnvironments  #1
         * 9: swabEnvironments  #2
         * 10: swabEnvironments  #3
         * 11: swabEnvironments #4
         * 12: swabEnvironments #5
         * 13: swabTest.bacteria
         * 14: swabTest.bacteriaSpecies
         */

        // const [d, m, y] = recordData[0].trim().split('/');
        // const day = d.length == 1 ? d : '0' + d;
        // const month = m.length == 1 ? m : '0' + m;
        // const year = parseInt('25' + y) - 543;
        // const swabAreaDateData = format(
        //   new Date(`${year}-${month}-${day}`),
        //   'yyyy-MM-dd',
        // );

        const swabAreaDateData = recordData[0].trim();

        const shiftData = recordData[1].trim() == 'D' ? Shift.DAY : Shift.NIGHT;

        let bacteriasData = [];
        let bacteriaSpeciesData = [];

        if (recordData[13].trim() != '-' && recordData[13].trim() == 'Yes') {
          bacteriasData.push(bacteria);
        }

        if (recordData[14].trim() != '-') {
          const bacteriaSpecies = recordData[14].trim().split(',');
          
          let whereOption = [];
          for (let index = 0; index < bacteriaSpecies.length; index++) {
            const bacteriaSpecieName = bacteriaSpecies[index];
            whereOption.push({ bacteriaSpecieName: bacteriaSpecieName });
          }
          
          const result_bacteriaSpecie = await this.bacteriaSpecieService.find({
            where: whereOption,
            transaction: true,
          });
          bacteriaSpeciesData = [...result_bacteriaSpecie];
        }

        let recordedAt = null;
        if (recordData[3].trim() != '-') {
          const [h, m] = recordData[3].trim().split('.');
          recordedAt = `${h.length == 1 ? '0' + h : h}:${m}:00`;
        }

        let facilityItemData = {};
        if (recordData[4].trim() == 'ขึ้นรูป') {
          facilityItemData = facilityItem['ไลน์4 ขึ้นรูป2'];
        }
        if (recordData[4].trim() == 'ตู้ Vac.') {
          facilityItemData = facilityItem['ตู้ Vac. โซนสุก No.2'];
        }
        if (recordData[4].trim() == 'ตู้ Steam') {
          facilityItemData = facilityItem['ตู้ Steam โซนสุก No.4'];
        }
        if (recordData[4].trim() == 'รถเข็นกะบะ') {
          facilityItemData = facilityItem['รถเข็นกะบะ โซนสุก'];
        }
        if (recordData[4].trim() == 'เครื่องซุยข้าว Aiho') {
          facilityItemData = facilityItem['เครื่องซุยข้าว Aiho No.2'];
        }
        if (recordData[4].trim() == 'กล่องเครื่องมือวิศวะ') {
          facilityItemData = facilityItem['กล่องเครื่องมือวิศวะ โซนสุก'];
        }
        
        const swabArea = await this.swabAreaRepository.findOne({
          where: {
            swabAreaName: recordData[5].trim(),
          },
          transaction: true,
        });

        let swabAreaData = null;
        
        if (swabArea) {
          swabAreaData = swabArea;
        } else {
          throw new Error(`Not Found swab area name "${recordData[5].trim()}"`);
        }

        const swabPeriodData = swabPeriods[recordData[6].trim()];

        const swabAreaAtpData =
          recordData[7].trim() == '-' ? null : parseInt(recordData[7].trim());

        let swabEnvironmentsData = [];

        if (
          recordData[8].trim() != '-' &&
          swabEnvironments[recordData[8].trim()]
        )
          swabEnvironmentsData.push(swabEnvironments[recordData[8].trim()]);
        if (
          recordData[9].trim() != '-' &&
          swabEnvironments[recordData[9].trim()]
        )
          swabEnvironmentsData.push(swabEnvironments[recordData[9].trim()]);
        if (
          recordData[10].trim() != '-' &&
          swabEnvironments[recordData[10].trim()]
        )
          swabEnvironmentsData.push(swabEnvironments[recordData[10].trim()]);
        if (
          recordData[11].trim() != '-' &&
          swabEnvironments[recordData[11].trim()]
        )
          swabEnvironmentsData.push(swabEnvironments[recordData[11].trim()]);
        if (
          recordData[12].trim() != '-' &&
          swabEnvironments[recordData[12].trim()]
        )
          swabEnvironmentsData.push(swabEnvironments[recordData[12].trim()]);

        console.log(1234, bacteriasData, bacteriaSpeciesData);
        
        const swabTestData = SwabTest.create({
            swabTestCode: `${recordData[2].trim()}/1`,
            swabTestRecordedAt: new Date(),
            bacteria: bacteriasData,
            bacteriaSpecies: bacteriaSpeciesData,
        });

        const historyData = {
          swabAreaDate: swabAreaDateData,
          swabAreaSwabedAt: recordedAt,
          swabAreaTemperature: null,
          swabAreaHumidity: null,
          swabAreaAtp: swabAreaAtpData,
          swabPeriod: swabPeriodData,
          swabTest: swabTestData,
          swabArea: swabAreaData,
          swabRound: { id: targetSwabRound.id },
          shift: shiftData,
          productLot: '',
          swabEnvironments: swabEnvironmentsData,
          facilityItem: facilityItemData,
        };

        // console.log(historyData);
        const swabAreaHistory = SwabAreaHistory.create(historyData);

        await queryRunnerManger.save(swabAreaHistory);
      }
    });
  }
}
