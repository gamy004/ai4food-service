import { differenceInDays, parse } from 'date-fns';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns-tz';
import { FindOptionsWhere, In, IsNull, Not, Repository } from 'typeorm';
import { Shift } from '~/common/enums/shift';
import { BodyCommandUpdateSwabPlanByIdDto } from '../dto/command-update-swab-plan-by-id.dto';
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
import { CleaningHistory } from '~/cleaning/entities/cleaning-history.entity';
import { RunningNumberService } from '~/common/services/running-number.service';
import { SwabCleaningValidationService } from './swab-cleaning-validation.service';
import { CleaningHistoryService } from '~/cleaning/services/cleaning-history.service';
import { SwabTestService } from './swab-test.service';
import { SwabAreaHistoryService } from './swab-area-history.service';

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
    private readonly runningNumberService: RunningNumberService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,
    @InjectRepository(SwabEnvironment)
    protected readonly swabEnvironmentRepository: Repository<SwabEnvironment>,
    @InjectRepository(SwabAreaHistoryImage)
    protected readonly swabAreaHistoryImageRepository: Repository<SwabAreaHistoryImage>,
    protected readonly swabAreaHistoryImageService: SwabAreaHistoryImageService,
    protected readonly swabCleaningValidationService: SwabCleaningValidationService,
    protected readonly cleaningHistoryService: CleaningHistoryService,
    protected readonly swabTestService: SwabTestService,
    protected readonly swabAreaHistoryService: SwabAreaHistoryService,
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

    if (swabAreaSwabedAt) {
      swabAreaHistory.swabAreaSwabedAt = swabAreaSwabedAt;
    }

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
    const {
      fromDate,
      toDate,
      roundNumberSwabTest,
      skipBigCleaning = false,
      includeGeneralBeforeBigCleaning = false,
      includeDayShiftFirstDay = false,
      includeNightShiftFirstDay = true,
      includeNightShiftLastDay = false,
    } = generateSwabPlanDto;

    let swabRound = await this.swabRoundService.findOneBy({
      swabRoundNumber: roundNumberSwabTest,
    });

    if (!swabRound) {
      swabRound = await this.swabRoundService.create({
        swabRoundNumber: roundNumberSwabTest,
      });
    }

    const runningNumberKey = `swab-area-history-round-${swabRound.swabRoundNumber}`;

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
        { swabPeriodName: 'หลัง Super Big Cleaning', deletedAt: null },
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
      { swabPeriodName: 'หลังล้างระหว่างงาน', deletedAt: null },
      { swabPeriodName: 'เดินไลน์หลังพัก 4 ชม.', deletedAt: null },
      { swabPeriodName: 'ก่อนล้างท้ายกะ', deletedAt: null },
      { swabPeriodName: 'หลังล้างท้ายกะ', deletedAt: null },
    ];

    let result_general = await this.swabPeriodService.findBy(
      generalSwabPeriodsTemplate,
    );

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
          {
            swabAreaName: 'ถาดรองเศษใต้ Portion', // no.1
            subSwabAreas: [],
          },
          {
            swabAreaName:
              'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว', //no.2
            subSwabAreas: [
              { swabAreaName: 'คานตู้ control หน้าเครื่อง Portion' },
              { swabAreaName: 'Cover ด้านบนเครื่อง' },
              { swabAreaName: 'ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว' },
            ],
          },
          {
            swabAreaName: 'สายพานลำเลียงถาด', //no.3
            subSwabAreas: [
              { swabAreaName: 'ตัวแผ่น' },
              { swabAreaName: 'ตัวกั้น' },
            ],
          },
          {
            swabAreaName: 'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน', // no.4
            subSwabAreas: [
              { swabAreaName: 'เลื่อนสายพาน' },
              { swabAreaName: 'รอยต่อโครงสร้างด้านใต้สายพาน' },
            ],
          },
          // {
          //   swabAreaName:
          //     'ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control', // แยกจุดย่อยมาเป็นจุดหลักตั้งแต่ 3 มี.ค.
          //   subSwabAreas: [
          //     { swabAreaName: 'ขาตั้งเครื่อง' },
          //     { swabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
          //     { swabAreaName: 'ช่องข้างขาตั้งชุด Control' },
          //   ],
          // },
          { swabAreaName: 'ขาตั้งเครื่อง', subSwabAreas: [] }, // no.5
          { swabAreaName: 'ใต้ฐานขาตั้งเครื่อง', subSwabAreas: [] }, // no.6
          { swabAreaName: 'ช่องข้างขาตั้งชุด Control', subSwabAreas: [] }, //no.7
          // {
          //   swabAreaName: 'ด้านบนตู้ Control Infeed และ สายไฟ',
          //   subSwabAreas: [
          //     { swabAreaName: 'ด้านบนตู้ Control Infeed' },
          //     { swabAreaName: 'สายไฟ' },
          //   ],
          // },
          { swabAreaName: 'ด้านบนตู้ Control Infeed', subSwabAreas: [] }, //no.8
          { swabAreaName: 'สายไฟ', subSwabAreas: [] }, //no.9
          {
            swabAreaName: 'พื้นใต้เครื่อง Portion', // no.10
            subSwabAreas: [],
          },
          {
            swabAreaName: 'รางระบายน้ำห้อง', // no.11
            subSwabAreas: [
              { swabAreaName: 'กลางราง' },
              { swabAreaName: 'ขอบรางซ้าย' },
              { swabAreaName: 'ขอบรางขวา' },
              { swabAreaName: 'Main Hole' },
            ],
          },
        ],
      },
      {
        facilityName: 'ตู้ Vac.',
        mainSwabAreas: [
          {
            swabAreaName: 'พื้นและ Slope', // no.12
            subSwabAreas: [{ swabAreaName: 'พื้น' }, { swabAreaName: 'Slope' }],
          },
        ],
      },
      {
        facilityName: 'ตู้ Steam',
        mainSwabAreas: [
          {
            swabAreaName: 'พื้นและ Slope', // no.13
            subSwabAreas: [{ swabAreaName: 'พื้น' }, { swabAreaName: 'Slope' }],
          },
        ],
      },
      {
        facilityName: 'รถเข็นกะบะ',
        mainSwabAreas: [
          {
            swabAreaName: 'ล้อรถเข็นกะบะ', // no.14
            subSwabAreas: [
              { swabAreaName: 'กันชน' },
              { swabAreaName: 'ระหว่างรอยต่อ' },
              { swabAreaName: 'โครงล้อ' },
            ],
          },
        ],
      },
      {
        facilityName: 'กล่องเครื่องมือวิศวะ',
        mainSwabAreas: [
          {
            swabAreaName: 'กล่องเครื่องมือวิศวะ', // no.15
            subSwabAreas: [
              { swabAreaName: 'ฝากล่อง' },
              { swabAreaName: 'ขอบมุม' },
              { swabAreaName: 'ประแจ' },
            ],
          },
        ],
      },
      {
        facilityName: 'ขึ้นรูป',
        mainSwabAreas: [
          {
            swabAreaName: 'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส', // no.16
            subSwabAreas: [
              {
                swabAreaName: 'แกน roller',
              },
              {
                swabAreaName: 'สายพาน PVC.',
              },
              {
                swabAreaName: 'ปีกสายพานสแตนเลส',
              },
            ],
          },
          {
            swabAreaName: 'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์', // no.17
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
              'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด', // no.18
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
            swabAreaName:
              'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์', // no.19
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
            swabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง', // no.20
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName:
              'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด', // no.21
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
              'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว', // no.22
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
            swabAreaName: 'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง', // no.23
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
            swabAreaName: 'ช่องใต้เฟรมสายพาน', // no.24
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'พื้นห้อง', // no.25
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'ผนังห้อง', // no.26
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ', // no.27
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
            swabAreaName: 'มือพนักงานช่างประกอบเครื่องหลังล้าง', // no.28
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'สายลมเครื่อง Portion', // no.29
            subSwabAreas: [],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName: 'เครื่องชั่ง Topping', // no.30
            subSwabAreas: [
              {
                swabAreaName: 'ถาดรองสแตนเลส',
              },
              {
                swabAreaName: 'หน้าจอ control',
              },
              {
                swabAreaName: 'ฐานขาตั้ง',
              },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
          },
          {
            swabAreaName:
              'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter', // no.31
            subSwabAreas: [
              { swabAreaName: 'ชุดเติมข้าว' },
              { swabAreaName: 'สายพานลำเลียง' },
              { swabAreaName: 'แกนซุย' },
              { swabAreaName: 'ชุด Hopper' },
              { swabAreaName: 'Shutter' },
            ],
            swabPeriodMapping: [
              'ก่อน Super Big Cleaning',
              'หลัง Super Big Cleaning',
            ], // จุดนี้ ตรวจแค่เฉพาะช่วง Big Cleaning (อาจมีการ custom จุดอื่นเพิ่ม)
            shiftMapping: ['day'],
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
    let SWAB_TEST_START_NUMBER_PREFIX = latestRunningNumber;

    this.transaction.execute(async () => {
      for (let index = 0; index < swabAreasTemplate.length; index++) {
        const { facilityName, mainSwabAreas = [] } = swabAreasTemplate[index];

        const fetchSwabAreas = await Promise.all(
          mainSwabAreas.map(async (mainSwabArea) => {
            const swabArea = await this.swabAreaRepository.findOne({
              where: {
                mainSwabAreaId: IsNull(),
                swabAreaName: mainSwabArea.swabAreaName,
                facility: {
                  facilityName,
                },
              },
              relations: ['subSwabAreas'],
              transaction: false,
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

      const generateSwabAreaHistory = async (
        swabAreaDate,
        swabArea,
        swabPeriod,
        shift = null,
        createSwabTest = true,
      ) => {
        const whereSwabAreaHistory = this.swabAreaHistoryService.toFilter({
          swabAreaDate: format(swabAreaDate, 'yyyy-MM-dd'),
          swabPeriodId: swabPeriod.id,
          swabAreaId: swabArea.id,
          shift,
        });

        let historyData = await this.swabAreaHistoryRepository.findOne({
          where: whereSwabAreaHistory,
        });

        if (!historyData) {
          historyData = SwabAreaHistory.create({
            swabAreaDate: format(swabAreaDate, 'yyyy-MM-dd'),
            swabPeriod,
            swabArea,
            shift,
            swabAreaSwabedAt: null,
            swabAreaTemperature: null,
            swabAreaHumidity: null,
            swabAreaAtp: null,
            swabTest: null,
            swabRound: null,
            productLot: '',
            cleaningHistory: null,
          });
        }

        if (createSwabTest) {
          let swabTestData;

          if (historyData.swabTestId) {
            swabTestData = await this.swabTestService.findOneBy({
              id: historyData.swabTestId,
            });
          }

          if (!swabTestData) {
            swabTestData = SwabTest.create({
              // swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${SWAB_TEST_START_NUMBER_PREFIX}${
              //   roundNumberSwabTest ? '/' + roundNumberSwabTest : ''
              // }`,
              swabTestCode: `${
                roundNumberSwabTest ? roundNumberSwabTest + '/' : ''
              }${SWAB_TEST_CODE_PREFIX}${SWAB_TEST_START_NUMBER_PREFIX}`,
              swabTestOrder: SWAB_TEST_START_NUMBER_PREFIX,
            });

            SWAB_TEST_START_NUMBER_PREFIX = SWAB_TEST_START_NUMBER_PREFIX + 1;

            if (swabRound) {
              swabTestData.swabRound = swabRound;
            }
          }

          historyData.swabTest = swabTestData;
        }

        if (swabRound) {
          historyData.swabRound = swabRound;
        }

        const swabCleaningValidations =
          await this.swabCleaningValidationService.findBy({
            swabPeriodId: swabPeriod.id,
            swabAreaId: swabArea.id,
          });

        if (swabCleaningValidations.length) {
          let cleaningHistoryData;

          if (historyData.id) {
            cleaningHistoryData = await this.cleaningHistoryService.findOneBy({
              swabAreaHistoryId: historyData.id,
            });
          }

          if (!cleaningHistoryData) {
            cleaningHistoryData = CleaningHistory.create();

            if (swabRound) {
              cleaningHistoryData.swabRound = swabRound;
            }
          }

          historyData.cleaningHistory = cleaningHistoryData;
        }

        const swabAreaHistory = SwabAreaHistory.create(historyData);

        return swabAreaHistory;
      };

      const generateHistory = async (
        swabAreasAll,
        currentDate = new Date(),
        dateIndex,
      ) => {
        currentDate.setDate(currentDate.getDate() + dateIndex);
        let shiftKeys = Object.keys(Shift);

        if (dateIndex === 0) {
          if (includeGeneralBeforeBigCleaning) {
            for (
              let index = 0;
              index < generalSwabPeriodsTemplate.length;
              index++
            ) {
              const swabPeriod =
                generalSwabPeriods[
                  generalSwabPeriodsTemplate[index].swabPeriodName
                ];

              if (
                swabPeriod.swabPeriodName === 'ก่อนล้างท้ายกะ' ||
                swabPeriod.swabPeriodName === 'หลังล้างท้ายกะ'
              ) {
                continue;
              }

              for (let index3 = 0; index3 < swabAreasAll.length; index3++) {
                const swabAreasGroupByFacility = swabAreasAll[index3];

                for (
                  let index = 0;
                  index < swabAreasGroupByFacility.length;
                  index++
                ) {
                  const swabAreas = swabAreasGroupByFacility[index];

                  const { subSwabAreas = [], swabPeriodMapping = [] } =
                    swabAreas;

                  if (
                    swabPeriodMapping.length &&
                    !swabPeriodMapping.includes(swabPeriod.swabPeriodName)
                  ) {
                    continue;
                  }
                  // const createSwabTest = subSwabAreas && subSwabAreas.length === 0;

                  const mainSwabAreaHistory = await generateSwabAreaHistory(
                    currentDate,
                    swabAreas,
                    swabPeriod,
                    'day',
                    true,
                  );

                  if (subSwabAreas && subSwabAreas.length > 0) {
                    const subSwabAreaHistories = [];

                    for (
                      let index4 = 0;
                      index4 < subSwabAreas.length;
                      index4++
                    ) {
                      const swabArea = subSwabAreas[index4];

                      const subSwabAreaHistory = await generateSwabAreaHistory(
                        currentDate,
                        swabArea,
                        swabPeriod,
                        'day',
                        false,
                      );

                      subSwabAreaHistories.push(subSwabAreaHistory);
                    }

                    if (subSwabAreaHistories.length) {
                      mainSwabAreaHistory.subSwabAreaHistories =
                        subSwabAreaHistories;
                    }
                  }

                  swabAreaHistories.push(mainSwabAreaHistory);
                }
              }
            }
          }

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
                    const mainSwabAreaHistory = await generateSwabAreaHistory(
                      currentDate,
                      swabAreas,
                      bigCleaningSwabPeriod,
                      shift,
                      true,
                    );

                    if (subSwabAreas && subSwabAreas.length > 0) {
                      const subSwabAreaHistories = [];

                      for (
                        let indexSubSwabArea = 0;
                        indexSubSwabArea < subSwabAreas.length;
                        indexSubSwabArea++
                      ) {
                        const swabArea = subSwabAreas[indexSubSwabArea];

                        const subSwabAreaHistory =
                          await generateSwabAreaHistory(
                            currentDate,
                            swabArea,
                            bigCleaningSwabPeriod,
                            shift,
                            false,
                          );

                        subSwabAreaHistories.push(subSwabAreaHistory);
                      }

                      if (subSwabAreaHistories.length) {
                        mainSwabAreaHistory.subSwabAreaHistories =
                          subSwabAreaHistories;
                      }
                    }

                    swabAreaHistories.push(mainSwabAreaHistory);
                  }
                } else {
                  const mainSwabAreaHistory = await generateSwabAreaHistory(
                    currentDate,
                    swabAreas,
                    bigCleaningSwabPeriod,
                    'day',
                    true,
                  );

                  if (subSwabAreas && subSwabAreas.length > 0) {
                    const subSwabAreaHistories = [];

                    for (
                      let index3 = 0;
                      index3 < subSwabAreas.length;
                      index3++
                    ) {
                      const swabArea = subSwabAreas[index3];

                      const subSwabAreaHistory = await generateSwabAreaHistory(
                        currentDate,
                        swabArea,
                        bigCleaningSwabPeriod,
                        'day',
                        false,
                      );

                      subSwabAreaHistories.push(subSwabAreaHistory);
                    }

                    if (subSwabAreaHistories.length) {
                      mainSwabAreaHistory.subSwabAreaHistories =
                        subSwabAreaHistories;
                    }
                  }

                  swabAreaHistories.push(mainSwabAreaHistory);
                }
              }
            }
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

                const mainSwabAreaHistory = await generateSwabAreaHistory(
                  currentDate,
                  swabAreas,
                  swabPeriod,
                  Shift[shiftKey],
                  true,
                );

                if (subSwabAreas && subSwabAreas.length > 0) {
                  const subSwabAreaHistories = [];

                  for (let index4 = 0; index4 < subSwabAreas.length; index4++) {
                    const swabArea = subSwabAreas[index4];

                    const subSwabAreaHistory = await generateSwabAreaHistory(
                      currentDate,
                      swabArea,
                      swabPeriod,
                      Shift[shiftKey],
                      false,
                    );

                    subSwabAreaHistories.push(subSwabAreaHistory);
                  }

                  if (subSwabAreaHistories.length) {
                    mainSwabAreaHistory.subSwabAreaHistories =
                      subSwabAreaHistories;
                  }
                }

                swabAreaHistories.push(mainSwabAreaHistory);
              }
            }
          }
        }
      };

      for (let dateIndex = 0; dateIndex <= NUMBER_OF_HISTORY_DAY; dateIndex++) {
        const currentDate = new Date(fromDate);

        await generateHistory(swabAreas, currentDate, dateIndex);
      }

      await this.swabAreaHistoryRepository.save(swabAreaHistories, {
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

  async saveSwabPlan(data: Array<String>) {
    data = [
      ' 2022-06-24 | D	|	1	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	2	|	-	|	ขึ้นรูป | ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	3	|	-	|	ขึ้นรูป | ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	4	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	5	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	6	|	-	|	ขึ้นรูป | โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	7	|	-	|	ขึ้นรูป | Cover มอเตอร์ แกนกลางเครื่อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	8	|	-	|	ขึ้นรูป | Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	9	|	-	|	ขึ้นรูป | ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	10	|	-	|	ขึ้นรูป | Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	11	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	12	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	13	|	-	|	ขึ้นรูป | ช่องใต้เฟรมสายพาน  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	14	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	15	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	16	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	17	|	-	|	ขึ้นรูป | พื้นห้อง   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	18	|	-	|	ขึ้นรูป | ผนังห้อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	19	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	20	|	-	|	ขึ้นรูป | แป้นกดสบู่ และ อ่างล้างมือ   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	21	|	-	|	ขึ้นรูป | มือพนักงานช่างประกอบเครื่องหลังล้าง  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | D	|	22	|	-	|	ขึ้นรูป | สายลมเครื่อง Portion  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	23	|	-	|	ขึ้นรูป | เครื่องชั่ง Topping  	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	24	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	25	|	-	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	26	|	-	|	ตู้ Steam | พื้นและ Slope   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | D	|	27	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	28	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | D	|	29	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อน Super Big Cleaning	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	30	|	14.34	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลัง Super Big Cleaning	|	64 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	31	|	14.35	|	ขึ้นรูป | ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์ 	|	หลัง Super Big Cleaning	|	32 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	32	|	19.16	|	ขึ้นรูป | ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด  	|	หลัง Super Big Cleaning	|	976 RLU ,  247 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	33	|	14.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลัง Super Big Cleaning	|	1269 RLU , 18 RLU	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	34	|	19.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลัง Super Big Cleaning	|	59 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	35	|	19.09	|	ขึ้นรูป | โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์ 	|	หลัง Super Big Cleaning	|	175 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	36	|	15.03	|	ขึ้นรูป | Cover มอเตอร์ แกนกลางเครื่อง 	|	หลัง Super Big Cleaning	|	18 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	37	|	19.10	|	ขึ้นรูป | Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด  	|	หลัง Super Big Cleaning	|	29 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	38	|	19.06	|	ขึ้นรูป | ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว 	|	หลัง Super Big Cleaning	|	25 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	39	|	15.07	|	ขึ้นรูป | Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง  	|	หลัง Super Big Cleaning	|	55 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	40	|	15.03	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลัง Super Big Cleaning	|	64 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	41	|	19.07	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลัง Super Big Cleaning	|	369 RLU , 66 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	42	|	19.15	|	ขึ้นรูป | ช่องใต้เฟรมสายพาน  	|	หลัง Super Big Cleaning	|	28 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	43	|	19.12	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลัง Super Big Cleaning	|	519 RLU ,  23 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	44	|	19.10	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	หลัง Super Big Cleaning	|	28 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	45	|	19.11	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลัง Super Big Cleaning	|	1351 RLU ,  196 RLU	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	46	|	18.27	|	ขึ้นรูป | พื้นห้อง   	|	หลัง Super Big Cleaning	|	185 RLU	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	47	|	18.23	|	ขึ้นรูป | ผนังห้อง  	|	หลัง Super Big Cleaning	|	7 RLU	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	48	|	18.30	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลัง Super Big Cleaning	|	443 RLU , 50 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	49	|	18.22	|	ขึ้นรูป | แป้นกดสบู่ และ อ่างล้างมือ   	|	หลัง Super Big Cleaning	|	254 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	50	|	20.55	|	ขึ้นรูป | มือพนักงานช่างประกอบเครื่องหลังล้าง  	|	หลัง Super Big Cleaning	|	36 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	51	|	18.25	|	ขึ้นรูป | สายลมเครื่อง Portion 	|	หลัง Super Big Cleaning	|	58 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	มีน้ำขัง	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	52	|	18.26	|	ขึ้นรูป | เครื่องชั่ง Topping  	|	หลัง Super Big Cleaning	|	8 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	53	|	18.21	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลัง Super Big Cleaning	|	7 RLU	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	54	|	17.33	|	ตู้ Vac. | พื้นและ Slope   	|	หลัง Super Big Cleaning	|	35 RLU	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีน้ำขัง	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	55	|	17.32	|	ตู้ Steam | พื้นและ Slope  	|	หลัง Super Big Cleaning	|	1039 RLU ,  96 RLU	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีรอยแตก	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	56	|	18.36	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลัง Super Big Cleaning	|	380 RLU , 55 RLU	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	57	|	17.34	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลัง Super Big Cleaning	|	9 RLU	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	58	|	17.35	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลัง Super Big Cleaning	|	9 RLU	|	มีความชื้น	|	มีผิวขรุขระ	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	59	|	20.51	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	60	|	20.21	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	61	|	20.50	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	62	|	20.48	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	63	|	20.47	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	64	|	20.22	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	65	|	20.45	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีรอยแยก	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	66	|	20.20	|	ขึ้นรูป | พื้นใต้เครื่อง Portion   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	67	|	20.18	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	68	|	20.19	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	มีผิวขรุขระ	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	69	|	20.13	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	70	|	20.12	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	71	|	20.14	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีเกลียว	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	72	|	20.16	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีผิวขรุขระ	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	73	|	20.53	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	74	|	0.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	75	|	0.08	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	76	|	0.09	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	77	|	0.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	78	|	0.10	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	79	|	0.07	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	80	|	0.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	81	|	0.08	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	82	|	0.13	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	83	|	0.14	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	84	|	0.05	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	85	|	0.05	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	86	|	0.13	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	87	|	0.06	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	88	|	0.07	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	89	|	0.23	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	90	|	0.22	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	91	|	0.24	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	92	|	0.24	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	93	|	0.23	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	94	|	0.24	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	95	|	0.22	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	96	|	0.25	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	97	|	0.25	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	98	|	0.17	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	99	|	0.18	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	100	|	0.18	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	101	|	0.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	102	|	0.19	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	103	|	0.20	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	104	|	4.22	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	105	|	4.17	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	106	|	4.20	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	107	|	4.18	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	108	|	4.19	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีรอยแยก	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	109	|	4.23	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	110	|	4.18	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	111	|	4.24	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	112	|	4.26	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	113	|	4.28	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	114	|	4.12	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	115	|	4.11	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	116	|	4.26	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	117	|	4.14	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	118	|	4.15	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	119	|	5.41	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	120	|	5.42	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	121	|	5.42	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	122	|	5.44	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	123	|	5.44	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	124	|	5.46	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	125	|	5.41	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	126	|	5.46	|	ขึ้นรูป | พื้นใต้เครื่อง Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	127	|	5.47	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	128	|	5.50	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	129	|	5.00	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	130	|	5.01	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	131	|	5.48	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua,	',
      '	2022-06-24 | N	|	132	|	5.02	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	133	|	5.02	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	134	|	7.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	135	|	7.58	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	136	|	7.55	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	137	|	7.52	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	138	|	7.59	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	139	|	7.54	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-24 | N	|	140	|	7.56	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	141	|	7.51	|	ขึ้นรูป | พื้นใต้เครื่อง Portion    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	142	|	7.49	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	143	|	8.02	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	144	|	5.32	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	145	|	5.33	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-24 | N	|	146	|	5.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	147	|	5.35	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-24 | N	|	148	|	5.35	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	149	|	8.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	150	|	8.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	151	|	8.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	152	|	8.46	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	153	|	8.48	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	154	|	8.42	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	155	|	8.41	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	156	|	8.40	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	157	|	8.49	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	158	|	8.55	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	159	|	8.52	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | D	|	160	|	8.53	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | D	|	161	|	8.44	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	162	|	8.50	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	163	|	8.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	164	|	10.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	165	|	10.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	166	|	10.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	167	|	10.46	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	168	|	10.48	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	169	|	10.42	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีคราบสกปรก	|	มีความชื้น	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	170	|	10.41	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	171	|	10.40	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	172	|	10.49	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	173	|	10.55	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	174	|	10.52	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีรอยแตก	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	175	|	10.53	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	176	|	10.44	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	177	|	10.50	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	178	|	10.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	179	|	13.07	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	180	|	13.10	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	181	|	13.09	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	182	|	13.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	183	|	13.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	184	|	13.08	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีคราบสกปรก	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	185	|	13.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	186	|	13.12	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	187	|	13.20	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	188	|	13.22	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	189	|	13.16	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีรอยแตก	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	190	|	13.15	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | D	|	191	|	13.14	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	192	|	13.26	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	193	|	13.25	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	194	|	17.12	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	195	|	17.11	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	196	|	17.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	197	|	17.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	198	|	17.13	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	199	|	17.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	200	|	17.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	201	|	17.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	202	|	17.15	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | D	|	203	|	17.16	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	204	|	17.13	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	205	|	17.15	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	206	|	17.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	207	|	17.10	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	208	|	17.11	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | D	|	209	|	18.30	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	210	|	18.31	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	211	|	18.31	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	212	|	18.32	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	213	|	18.32	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	214	|	18.31	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	215	|	18.33	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	216	|	18.30	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	217	|	18.34	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	218	|	18.34	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	219	|	17.12	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	220	|	17.13	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีผิวขรุขระ	|	มีรอยแตก	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	221	|	17.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	222	|	17.10	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	มีเศษอาหาร	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	223	|	17.11	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	มีเศษอาหาร	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	224	|	18.57	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	225	|	19.06	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	226	|	19.08	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	227	|	19.04	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	228	|	19.07	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	229	|	19.05	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	230	|	19.05	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	231	|	19.07	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	232	|	19.10	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	233	|	18.58	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | D	|	234	|	18.39	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	235	|	18.39	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	236	|	18.38	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	237	|	18.37	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | D	|	238	|	18.37	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	239	|	19.20	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	240	|	19.15	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	241	|	19.16	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	242	|	19.16	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	243	|	19.18	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	244	|	19.17	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	245	|	19.19	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	246	|	19.21	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	247	|	19.27	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	248	|	19.22	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	249	|	18.40	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	250	|	18.42	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	251	|	18.52	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	252	|	18.53	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	253	|	18.54	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	254	|	23.21	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	255	|	23.30	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	256	|	23.30	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	257	|	23.29	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	258	|	23.27	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	259	|	23.30	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	260	|	23.29	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	261	|	23.29	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	262	|	23.01	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	263	|	22.31	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	264	|	22.23	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	265	|	22.22	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	266	|	22.24	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	267	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	268	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	269	|	23.39	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	270	|	23.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	271	|	23.51	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	272	|	23.48	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	273	|	23.47	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	274	|	23.49	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	275	|	23.50	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	276	|	23.49	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	277	|	23.57	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	278	|	22.37	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	279	|	23.08	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	280	|	23.07	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	281	|	23.08	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	282	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	283	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	284	|	5.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	285	|	5.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	286	|	5.12	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	287	|	5.11	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	288	|	5.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	289	|	5.06	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	290	|	5.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	291	|	5.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	292	|	5.15	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	293	|	3.26	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	294	|	3.22	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	295	|	3.18	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีรอยแตก	|	-	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	296	|	3.21	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	297	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	298	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-25 | N	|	299	|	5.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	300	|	5.14	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	301	|	5.15	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	302	|	5.13	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	303	|	5.13	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	304	|	5.15	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	305	|	5.14	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	306	|	5.14	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	307	|	5.17	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	308	|	4.25	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	309	|	4.22	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	310	|	4.23	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	311	|	4.23	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	312	|	4.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	313	|	4.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	314	|	5.30	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	315	|	5.51	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	316	|	5.52	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-25 | N	|	317	|	5.50	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	318	|	5.48	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	319	|	5.49	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	320	|	5.51	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	321	|	5.49	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-25 | N	|	322	|	6.00	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	323	|	5.45	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	324	|	5.38	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	325	|	5.37	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-25 | N	|	326	|	5.36	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	327	|	5.29	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-25 | N	|	328	|	5.28	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	329	|	9.05	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	330	|	9.03	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	331	|	9.03	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	332	|	9.04	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	333	|	9.04	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	334	|	9.01	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	335	|	9.00	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	336	|	9.01	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	337	|	9.06	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	338	|	9.09	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	339	|	8.53	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | D	|	340	|	8.55	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	341	|	8.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	342	|	8.54	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	343	|	8.55	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	344	|	12.02	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	345	|	12.01	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	346	|	12.00	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	347	|	12.02	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	348	|	12.03	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	349	|	12.00	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	350	|	12.02	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	351	|	12.04	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	352	|	12.04	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	353	|	12.04	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	354	|	11.54	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	355	|	11.55	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	356	|	11.54	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	357	|	11.53	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	358	|	11.54	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	359	|	12.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	360	|	12.46	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	361	|	12.45	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	362	|	12.44	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	363	|	12.45	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	364	|	12.46	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	365	|	12.47	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	366	|	12.46	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	367	|	12.47	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	368	|	12.52	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	369	|	12.50	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	370	|	12.50	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	371	|	12.50	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | D	|	372	|	12.49	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	373	|	12.49	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	374	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	375	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	376	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	377	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	378	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	379	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	380	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	381	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	382	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	383	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	384	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	385	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	386	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	387	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	388	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | D	|	389	|	17.37	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	390	|	17.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	391	|	17.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	392	|	17.37	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	393	|	17.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	394	|	17.35	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	395	|	17.40	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	396	|	17.36	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	397	|	17.41	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	398	|	17.43	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	399	|	17.41	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	400	|	17.42	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	401	|	17.43	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	402	|	17.42	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	403	|	17.47	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	404	|	18.19	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	405	|	18.20	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	406	|	18.18	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	407	|	19.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	408	|	18.20	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	409	|	18.23	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	410	|	18.21	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	411	|	18.22	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	412	|	17.49	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	413	|	18.30	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	414	|	18.46	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	415	|	18.48	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | D	|	416	|	18.49	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	417	|	18.47	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | D	|	418	|	18.48	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	419	|	19.00	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	420	|	19.00	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	421	|	19.01	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	422	|	19.05	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	423	|	19.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	424	|	19.10	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	425	|	19.06	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	426	|	19.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	427	|	19.07	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	428	|	19.02	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	429	|	18.00	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	430	|	18.00	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	431	|	18.02	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	432	|	18.01	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	433	|	18.01	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	434	|	22.58	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	435	|	23.03	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	436	|	23.01	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	437	|	23.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	438	|	23.01	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	439	|	22.59	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	440	|	23.01	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	441	|	23.02	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	442	|	23.03	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	443	|	22.16	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	444	|	22.07	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	445	|	22.06	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	446	|	22.09	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	447	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	448	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	449	|	23.21	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	450	|	23.29	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	451	|	23.30	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	452	|	23.32	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	453	|	23.31	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	454	|	23.31	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	455	|	23.31	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	456	|	23.31	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	457	|	23.32	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	458	|	22.26	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	459	|	22.11	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	460	|	22.12	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	461	|	22.13	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	462	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	463	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	464	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	465	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	466	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	467	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	468	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	469	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	470	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	471	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	472	|	2.19	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	473	|	2.10	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	474	|	2.08	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีคราบสกปรก	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	475	|	2.07	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	476	|	2.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	477	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	478	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-26 | N	|	479	|	4.27	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	480	|	4.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	481	|	4.24	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-26 | N	|	482	|	4.26	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	483	|	4.29	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	484	|	4.26	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	485	|	4.28	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	486	|	4.25	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	487	|	4.30	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	488	|	4.48	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	489	|	4.26	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	490	|	3.36	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	491	|	4.25	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	492	|	2.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	493	|	2.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	494	|	5.25	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	495	|	5.33	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	496	|	5.29	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-26 | N	|	497	|	5.29	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	498	|	5.28	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	499	|	5.43	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	500	|	5.27	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	501	|	5.44	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-26 | N	|	502	|	6.00	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	503	|	4.53	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	504	|	5.18	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	505	|	4.02	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-26 | N	|	506	|	5.17	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	507	|	5.19	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-26 | N	|	508	|	5.18	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	509	|	5.34	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	510	|	5.35	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	511	|	5.37	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	512	|	5.36	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	513	|	5.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	514	|	5.43	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	515	|	5.36	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	516	|	5.44	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	517	|	6.00	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	518	|	5.47	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	519	|	5.14	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	520	|	5.16	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | D	|	521	|	5.14	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	522	|	5.13	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	523	|	5.12	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	524	|	12.12	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	525	|	12.13	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	526	|	12.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	527	|	12.11	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	528	|	12.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	529	|	12.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	530	|	12.13	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	531	|	12.14	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	532	|	12.19	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	533	|	12.20	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	534	|	12.16	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | D	|	535	|	12.17	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	536	|	12.18	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	537	|	12.15	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	538	|	12.16	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	มีเศษอาหาร	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	539	|	12.31	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	540	|	12.32	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	541	|	12.34	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	542	|	12.30	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	543	|	12.33	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	544	|	12.34	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	545	|	12.33	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	546	|	12.34	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	547	|	12.36	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	548	|	12.40	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	549	|	-	|	ตู้ Vac. | พื้นและ Slope   	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	550	|	-	|	ตู้ Steam | พื้นและ Slope   	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	551	|	12.37	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | D	|	552	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	553	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	554	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	555	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	556	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	557	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	558	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	559	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	560	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	561	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	562	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	563	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	564	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	565	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	566	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	567	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	568	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | D	|	569	|	15.18	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	570	|	15.19	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	571	|	15.19	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	572	|	15.20	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	573	|	15.22	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	574	|	15.21	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	575	|	15.21	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	576	|	15.20	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	577	|	15.23	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	578	|	15.25	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	579	|	13.58	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	580	|	13.59	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | D	|	581	|	14.00	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	582	|	13.58	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	583	|	13.57	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	584	|	16.03	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	585	|	15.54	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	586	|	15.55	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	587	|	15.51	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	588	|	15.53	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	589	|	15.55	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	590	|	15.53	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	591	|	16.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	592	|	16.04	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	593	|	16.04	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	594	|	15.14	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	595	|	15.14	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	596	|	15.15	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua	',
      '	2022-06-27 | D	|	597	|	15.12	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | D	|	598	|	15.12	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	599	|	16.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีเกลียว	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	600	|	16.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	601	|	16.07	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	602	|	16.07	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	603	|	16.08	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	604	|	16.05	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	605	|	16.05	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	606	|	16.08	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	607	|	16.20	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	608	|	16.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	609	|	15.28	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	610	|	15.28	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	611	|	15.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	612	|	16.11	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	613	|	16.11	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	614	|	24.00	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	615	|	24.01	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	616	|	24.04	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	617	|	24.00	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	618	|	24.02	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	619	|	24.03	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	620	|	24.03	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	621	|	24.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	622	|	24.04	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	623	|	22.33	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	624	|	22.29	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	625	|	22.30	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	626	|	22.31	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	627	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	628	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	629	|	24.23	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	630	|	24.25	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	631	|	24.26	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	632	|	24.24	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	633	|	24.23	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	634	|	24.25	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	635	|	24.24	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	636	|	24.25	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	637	|	24.27	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	638	|	22.54	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	639	|	23.00	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	640	|	22.59	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	641	|	22.57	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	642	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	643	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	644	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	645	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	646	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	647	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	648	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	649	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	650	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	651	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	652	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	653	|	2.34	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	654	|	2.36	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	655	|	2.31	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	656	|	2.34	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	657	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	658	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-27 | N	|	659	|	4.45	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	660	|	4.57	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	661	|	4.56	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	662	|	4.56	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	663	|	4.58	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	664	|	4.46	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	665	|	4.57	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	666	|	4.55	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	667	|	4.59	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	668	|	5.00	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	669	|	5.06	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	670	|	5.05	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-27 | N	|	671	|	5.08	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	672	|	2.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	673	|	2.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	674	|	5.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	675	|	5.58	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	676	|	5.58	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	677	|	5.57	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	678	|	5.59	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	679	|	5.57	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	680	|	5.58	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	681	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	682	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	683	|	5.54	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	684	|	5.49	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	685	|	5.50	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-27 | N	|	686	|	5.50	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	687	|	5.49	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-27 | N	|	688	|	5.49	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	689	|	6.01	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	690	|	6.00	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	691	|	6.01	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	692	|	5.59	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	693	|	6.02	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	694	|	6.01	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	695	|	6.00	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	696	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	697	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	698	|	5.54	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	699	|	5.52	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	700	|	5.53	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | D	|	701	|	5.53	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	702	|	5.51	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	703	|	5.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	704	|	12.14	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	705	|	12.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	706	|	12.20	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	707	|	12.23	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	708	|	12.25	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	709	|	12.16	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีเกลียว	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	710	|	12.43	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	711	|	12.22	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	712	|	12.28	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	713	|	12.12	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	714	|	10.30	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	715	|	10.31	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	716	|	10.34	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	717	|	10.33	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	718	|	10.28	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	719	|	12.53	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	720	|	12.54	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	721	|	12.52	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	722	|	12.56	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	723	|	12.55	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	724	|	12.51	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	725	|	13.03	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	726	|	12.57	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	727	|	13.02	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	728	|	12.59	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	729	|	10.41	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	730	|	10.40	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีผิวขรุขระ	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	731	|	10.45	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	732	|	10.42	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	733	|	10.43	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	734	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	735	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	736	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	737	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	738	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	739	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	740	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	741	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	742	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	743	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | D	|	744	|	15.03	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	745	|	15.02	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	746	|	15.02	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | D	|	747	|	15.01	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	748	|	15.01	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	749	|	16.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	750	|	16.55	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	751	|	16.53	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	752	|	16.55	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	753	|	16.54	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	754	|	16.56	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	755	|	16.57	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	756	|	16.56	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	757	|	16.58	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	758	|	16.59	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	759	|	15.00	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	760	|	15.03	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	761	|	15.02	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	762	|	14.59	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	763	|	15.01	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	764	|	18.56	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	765	|	18.58	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	766	|	18.55	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	767	|	18.57	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	768	|	18.59	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	769	|	18.59	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	770	|	18.55	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	771	|	18.58	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | D	|	772	|	18.56	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	773	|	19.00	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	774	|	17.11	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	775	|	17.08	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	776	|	17.11	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	777	|	17.05	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | D	|	778	|	17.06	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	779	|	19.12	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	780	|	19.13	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	781	|	19.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	782	|	19.11	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	783	|	19.15	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	784	|	19.14	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	785	|	19.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	786	|	19.15	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	787	|	19.16	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	788	|	19.17	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	789	|	17.17	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	790	|	17.17	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	791	|	17.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	792	|	17.16	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	793	|	17.15	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	794	|	23.38	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	795	|	23.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	796	|	23.41	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-28 | N	|	797	|	23.40	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	798	|	23.39	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	799	|	23.41	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	800	|	23.40	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	801	|	23.41	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	802	|	23.42	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	803	|	22.20	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	804	|	22.16	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	805	|	22.15	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	806	|	22.18	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	807	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	808	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	809	|	23.52	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	810	|	24.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	811	|	24.08	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	812	|	24.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	813	|	24.09	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	814	|	24.08	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	815	|	24.08	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	816	|	24.08	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	817	|	24.06	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	818	|	22.44	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	819	|	22.45	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	820	|	22.34	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	821	|	22.36	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	822	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	823	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	824	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	825	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	826	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	827	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	828	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	829	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	830	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	831	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	832	|	4.00	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	833	|	3.06	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	834	|	3.04	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีคราบสกปรก	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	835	|	3.01	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	836	|	3.32	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	837	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	838	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	839	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-28 | N	|	840	|	5.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	841	|	5.27	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	842	|	5.26	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	843	|	5.27	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	844	|	5.26	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	845	|	5.26	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	846	|	5.26	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	847	|	5.29	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	848	|	5.00	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	849	|	4.49	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	850	|	4.51	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	851	|	4.28	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	852	|	2.32	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	853	|	2.31	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	854	|	6.24	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-28 | N	|	855	|	6.27	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	856	|	6.25	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-28 | N	|	857	|	6.24	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	858	|	6.25	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	859	|	6.26	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	860	|	6.25	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	861	|	6.26	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	862	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	863	|	5.49	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	864	|	5.40	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	865	|	5.35	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-28 | N	|	866	|	5.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	867	|	5.38	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-28 | N	|	868	|	5.37	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	869	|	6.38	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	870	|	6.39	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	871	|	6.39	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	872	|	6.37	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	873	|	6.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	874	|	6.38	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	875	|	6.38	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	876	|	6.37	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	877	|	6.42	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	878	|	5.49	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	879	|	5.41	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	880	|	5.36	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | D	|	881	|	5.40	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	882	|	5.38	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	883	|	5.38	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	884	|	11.11	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	885	|	11.12	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	886	|	11.12	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	887	|	11.10	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	888	|	11.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	889	|	11.09	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	890	|	11.09	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	891	|	11.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	892	|	11.13	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	893	|	11.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	894	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	895	|	-	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	896	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	897	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	898	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	899	|	11.27	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	900	|	11.24	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	901	|	11.26	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	902	|	11.25	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	903	|	11.23	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	904	|	11.25	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	905	|	11.24	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	906	|	11.23	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	907	|	11.29	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	908	|	11.28	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	909	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	910	|	-	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	911	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	912	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	913	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	914	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	915	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	916	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	917	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	918	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	919	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	920	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	921	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	922	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	923	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	924	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	925	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	926	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	927	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	928	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | D	|	929	|	15.08	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	930	|	15.10	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	931	|	15.11	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	932	|	15.06	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	933	|	15.09	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	934	|	15.12	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	935	|	15.07	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	936	|	15.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	937	|	15.13	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	938	|	15.14	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	939	|	15.02	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	940	|	15.00	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | D	|	941	|	15.04	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	942	|	15.01	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	943	|	15.02	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	944	|	16.43	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	945	|	16.47	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	946	|	16.44	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	947	|	16.42	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	948	|	16.45	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	949	|	16.42	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	950	|	16.46	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	951	|	16.47	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	952	|	16.48	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	953	|	16.49	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	954	|	16.28	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	955	|	16.31	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | D	|	956	|	16.32	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	957	|	16.26	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | D	|	958	|	16.27	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	959	|	16.52	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter 	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	960	|	16.55	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	961	|	16.53	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	962	|	16.55	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	963	|	16.52	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	964	|	16.54	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	965	|	16.54	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	966	|	16.54	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	967	|	16.56	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	968	|	16.50	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	969	|	16.33	|	ตู้ Vac. | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	970	|	16.37	|	ตู้ Steam | พื้นและ Slope   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	971	|	16.38	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	972	|	16.35	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	973	|	16.37	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	974	|	24.36	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   |	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	975	|	24.37	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	976	|	24.38	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	977	|	24.36	| ขึ้นรูป |	สายพานลำเลียงถาด  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	978	|	24.35	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	979	|	24.37	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	980	|	24.34	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	981	|	24.38	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	982	|	24.40	|	ขึ้นรูป | รางระบายน้ำห้อง  |	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	983	|	21.55	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  |	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	984	|	21.51	|	ตู้ Vac. | พื้นและ Slope  |	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	985	|	21.49	|	ตู้ Steam | พื้นและ Slope  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	986	|	21.47	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  |	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	987	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  |	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	988	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  |	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	989	|	1.15	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	990	|	1.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	991	|	1.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	992	|	1.11	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	993	|	1.10	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	994	|	1.10	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	995	|	1.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	996	|	1.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	997	|	1.12	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	998	|	22.08	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	999	|	22.06	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1000	|	22.03	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1001	|	22.04	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1002	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1003	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1004	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1005	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1006	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1007	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1008	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1009	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1010	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1011	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1012	|	2.34	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1013	|	2.29	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1014	|	2.30	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1015	|	2.22	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | N	|	1016	|	2.35	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1017	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1018	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1019	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1020	|	4.22	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1021	|	4.21	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1022	|	4.22	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1023	|	4.21	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1024	|	4.22	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1025	|	4.20	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1026	|	4.21	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1027	|	4.23	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1028	|	4.28	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1029	|	3.28	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1030	|	3.27	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua	',
      '	2022-06-29 | N	|	1031	|	3.26	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1032	|	4.39	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1033	|	4.39	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1034	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-29 | N	|	1035	|	5.10	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1036	|	5.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1037	|	5.08	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1038	|	5.09	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1039	|	5.09	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1040	|	5.09	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1041	|	5.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-29 | N	|	1042	|	5.18	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1043	|	5.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1044	|	3.46	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1045	|	3.45	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-29 | N	|	1046	|	3.48	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.seeligeri	',
      '	2022-06-29 | N	|	1047	|	5.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-29 | N	|	1048	|	5.21	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1049	|	5.13	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1050	|	5.12	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1051	|	5.11	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1052	|	5.13	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1053	|	5.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1054	|	5.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1055	|	5.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1056	|	5.12	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1057	|	5.18	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1058	|	5.15	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1059	|	5.20	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1060	|	5.21	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1061	|	5.20	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1062	|	5.22	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1063	|	5.22	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1064	|	12.03	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1065	|	12.06	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1066	|	12.07	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1067	|	12.07	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1068	|	12.05	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1069	|	12.07	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1070	|	12.05	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1071	|	12.06	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1072	|	12.08	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1073	|	12.10	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1074	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1075	|	-	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1076	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1077	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1078	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1079	|	12.28	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1080	|	12.28	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1081	|	12.27	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1082	|	12.26	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1083	|	12.29	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1084	|	12.27	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1085	|	12.29	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1086	|	12.28	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1087	|	12.29	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1088	|	12.31	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1089	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1090	|	-	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1091	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1092	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1093	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1094	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1095	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1096	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1097	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1098	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1099	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1100	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1101	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1102	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1103	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1104	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1105	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1106	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1107	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1108	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | D	|	1109	|	16.42	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1110	|	16.42	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1111	|	16.44	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1112	|	16.44	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1113	|	16.45	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1114	|	16.45	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1115	|	16.43	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1116	|	16.43	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1117	|	16.46	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1118	|	16.47	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1119	|	16.12	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1120	|	16.12	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | D	|	1121	|	16.16	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1122	|	16.15	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1123	|	16.13	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1124	|	17.06	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	มีเกลียว	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1125	|	17.31	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1126	|	17.32	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1127	|	17.30	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1128	|	17.33	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1129	|	17.32	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีร่อง/มีรู	|	มีความชื้น	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1130	|	17.30	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | D	|	1131	|	17.33	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1132	|	17.37	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1133	|	17.34	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1134	|	16.56	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | D	|	1135	|	16.53	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1136	|	16.52	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1137	|	16.53	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | D	|	1138	|	16.53	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-06-30 | N	|	1139	|	17.53	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1140	|	17.54	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1141	|	17.54	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   |	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1142	|	17.53	| ขึ้นรูป |	สายพานลำเลียงถาด   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1143	|	17.54	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1144	|	17.55	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control     |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1145	|	17.55	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1146	|	17.55	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1147	|	17.58	|	ขึ้นรูป | รางระบายน้ำห้อง   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1148	|	17.56	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   |	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1149	|	17.03	|	ตู้ Vac. | พื้นและ Slope   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1150	|	17.04	|	ตู้ Steam | พื้นและ Slope   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1151	|	17.03	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1152	|	17.04	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1153	|	17.04	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   |	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1154	|	23.11	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1155	|	23.11	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1156	|	23.11	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1157	|	23.10	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1158	|	23.10	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1159	|	23.09	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1160	|	23.09	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1161	|	23.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1162	|	23.12	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1163	|	23.14	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1164	|	22.50	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1165	|	22.50	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1166	|	23.13	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1167	|	22.51	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1168	|	22.51	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1169	|	23.25	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1170	|	23.36	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1171	|	23.35	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1172	|	23.35	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1173	|	23.37	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1174	|	23.36	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1175	|	23.35	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1176	|	23.36	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1177	|	23.24	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1178	|	23.38	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1179	|	23.18	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1180	|	23.18	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1181	|	23.37	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1182	|	23.17	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1183	|	23.17	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1184	|	3.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1185	|	3.11	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1186	|	3.13	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1187	|	3.10	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1188	|	3.12	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1189	|	3.13	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1190	|	3.12	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1191	|	3.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1192	|	3.14	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1193	|	3.16	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1194	|	2.58	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1195	|	2.58	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1196	|	2.59	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1197	|	2.00	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1198	|	2.00	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1199	|	4.59	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1200	|	5.00	|	ขึ้นรูป | ถาดรองเศษใต้ Portion   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1201	|	4.59	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1202	|	5.00	| ขึ้นรูป |	สายพานลำเลียงถาด   	|	ก่อนล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1203	|	5.02	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน   	|	ก่อนล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1204	|	5.02	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1205	|	5.01	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ   	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1206	|	5.03	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1207	|	5.04	|	ขึ้นรูป | รางระบายน้ำห้อง   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1208	|	4.42	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ   	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1209	|	4.40	|	ตู้ Vac. | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1210	|	4.40	|	ตู้ Steam | พื้นและ Slope   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1211	|	5.06	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1212	|	4.39	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1213	|	4.39	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท   	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1214	|	5.29	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1215	|	5.31	|	ขึ้นรูป | ถาดรองเศษใต้ Portion     	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1216	|	5.29	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว     	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1217	|	5.29	| ขึ้นรูป |	สายพานลำเลียงถาด    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1218	|	5.32	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน    	|	หลังล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1219	|	5.30	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control    	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีความชื้น	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1220	|	5.30	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1221	|	5.30	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1222	|	5.36	|	ขึ้นรูป | รางระบายน้ำห้อง    	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1223	|	5.37	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ    	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1224	|	5.27	|	ตู้ Vac. | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-06-30 | N	|	1225	|	5.27	|	ตู้ Steam | พื้นและ Slope    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-06-30 | N	|	1226	|	5.34	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1227	|	5.26	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-06-30 | N	|	1228	|	5.26	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท    	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1229	|	8.42	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter   	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1230	|	8.42	|	ขึ้นรูป | ถาดรองเศษใต้ Portion 	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1231	|	8.43	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1232	|	8.42	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1233	|	8.43	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1234	|	8.44	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1235	|	8.43	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1236	|	8.44	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1237	|	8.45	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1238	|	8.45	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังประกอบเครื่อง	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1239	|	8.56	|	ตู้ Vac. | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีน้ำขัง	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	1240	|	8.56	|	ตู้ Steam | พื้นและ Slope  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีร่อง/มีรู	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1241	|	8.56	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1242	|	8.55	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1243	|	8.55	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังประกอบเครื่อง	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1244	|	12.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1245	|	12.08	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1246	|	12.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1247	|	12.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1248	|	12.08	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1249	|	12.10	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1250	|	12.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1251	|	12.10	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1252	|	12.09	|	ขึ้นรูป | รางระบายน้ำห้อง 	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1253	|	12.13	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1254	|	12.13	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1255	|	12.13	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	1256	|	12.12	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างระหว่างงาน	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1257	|	12.12	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1258	|	12.12	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1259	|	12.17	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1260	|	12.18	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1261	|	12.15	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	หลังล้างระหว่างงาน	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1262	|	12.18	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1263	|	12.17	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	1264	|	12.15	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเกลียว	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	1265	|	12.15	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1266	|	12.16	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1267	|	12.16	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างระหว่างงาน	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1268	|	12.22	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างระหว่างงาน	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1269	|	12.21	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1270	|	12.21	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	มีผิวขรุขระ	|	มีรอยแตก	|	-	|	-	|	Yes	|	  L.innocua, L.monocytogenes 	',
      '	2022-07-01 | D	|	1271	|	12.21	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1272	|	12.20	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1273	|	12.20	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างระหว่างงาน	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1274	|	-	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1275	|	-	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีความชื้น	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1276	|	-	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1277	|	-	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1278	|	-	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1279	|	-	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเกลียว	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1280	|	-	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1281	|	-	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1282	|	-	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1283	|	-	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	-	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1284	|	-	|	ตู้ Vac. | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1285	|	-	|	ตู้ Steam | พื้นและ Slope  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1286	|	-	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีคราบสกปรก	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1287	|	-	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1288	|	-	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	เดินไลน์หลังพัก 4 ชม.	|	-	|	มีเศษอาหาร	|	มีร่อง/มีรู	|	-	|	-	|	-	|	-	|	ยกเลิกส่งตัวอย่าง	',
      '	2022-07-01 | D	|	1289	|	15.10	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1290	|	15.09	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1291	|	15.10	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1292	|	15.09	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	ก่อนล้างท้ายกะ	|	-	|	มีร่อง/มีรู	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1293	|	15.11	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	ก่อนล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1294	|	15.08	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีเกลียว	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1295	|	15.11	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	ก่อนล้างท้ายกะ	|	-	|	มีน้ำขัง	|	มีเศษอาหาร	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1296	|	15.09	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1297	|	15.11	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1298	|	15.32	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	ก่อนล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1299	|	14.21	|	ตู้ Vac. | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1300	|	14.22	|	ตู้ Steam | พื้นและ Slope  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1301	|	14.22	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีคราบสกปรก	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1302	|	14.20	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว 	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1303	|	14.20	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	ก่อนล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1304	|	15.36	|	ขึ้นรูป | ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1305	|	15.40	|	ขึ้นรูป | ถาดรองเศษใต้ Portion  	|	หลังล้างท้ายกะ	|	-	|	มีเศษอาหาร	|	มีน้ำขัง	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1306	|	15.37	|	ขึ้นรูป | คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1307	|	15.37	| ขึ้นรูป |	สายพานลำเลียงถาด  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีเศษอาหาร	|	มีรอยแยก	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1308	|	15.39	|	ขึ้นรูป | เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน  	|	หลังล้างท้ายกะ	|	-	|	มีรอยแยก	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1309	|	15.38	|	ขึ้นรูป | ขาตั้งเครื่อง, ใต้ฐานขาตั้งเครื่อง และ ช่องข้างขาตั้งชุด Control  	|	หลังล้างท้ายกะ	|	-	|	มีเกลียว	|	มีความชื้น	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1310	|	15.38	|	ขึ้นรูป | ด้านบนตู้ Control Infeed และ สายไฟ  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1311	|	15.38	|	ขึ้นรูป | พื้นใต้เครื่อง Portion  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1312	|	15.41	|	ขึ้นรูป | รางระบายน้ำห้อง  	|	หลังล้างท้ายกะ	|	-	|	มีน้ำขัง	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1313	|	15.43	|	กล่องเครื่องมือวิศวะ | กล่องเครื่องมือวิศวะ  	|	หลังล้างท้ายกะ	|	-	|	-	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1314	|	15.32	|	ตู้ Vac. | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	Yes	|	 L.monocytogenes 	',
      '	2022-07-01 | D	|	1315	|	15.33	|	ตู้ Steam | พื้นและ Slope  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	มีรอยแตก	|	มีผิวขรุขระ	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1316	|	15.32	|	รถเข็นกะบะ | ล้อรถเข็นกะบะ  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1317	|	15.31	|	เครื่องซุยข้าว Aiho | แกนสายพานซุยข้าว  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
      '	2022-07-01 | D	|	1318	|	15.31	|	เครื่องซุยข้าว Aiho | สายพาน และ แผ่นเพลท  	|	หลังล้างท้ายกะ	|	-	|	มีความชื้น	|	-	|	-	|	-	|	-	|	No	|	-	',
    ];

    await this.transaction.execute(async (queryRunnerManger) => {
      const whereSwabRound: FindOptionsWhere<SwabRound> = {
        swabRoundNumber: '1',
      };

      let targetSwabRound = await this.swabRoundService.findOne({
        where: whereSwabRound,
        transaction: false,
      });

      if (!targetSwabRound) {
        targetSwabRound = await queryRunnerManger.save(
          this.swabRoundService.make({
            swabRoundNumber: whereSwabRound.swabRoundNumber as string,
          }),
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
        transaction: false,
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
        transaction: false,
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
        transaction: false,
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
        transaction: false,
      });

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
            whereOption.push({ bacteriaSpecieName: bacteriaSpecieName.trim() });
          }

          const result_bacteriaSpecie = await this.bacteriaSpecieService.find({
            where: whereOption,
            transaction: false,
          });

          bacteriaSpeciesData = [...result_bacteriaSpecie];
        }

        // set default swabed at time to be '00:00:00'
        let swabAreaSwabedAt = '00:00:00';

        if (recordData[3].trim() != '-') {
          const [h, m] = recordData[3].trim().split('.');

          swabAreaSwabedAt = `${h.length == 1 ? '0' + h : h}:${m}:00`;
        }

        const swabTestRecordedAt = this.dateTransformer.toShiftTimestamp(
          swabAreaDateData,
          swabAreaSwabedAt,
          shiftData,
          'Asia/Bangkok',
        );

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
          transaction: false,
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

        const swabTestOrder = parseInt(recordData[2].trim());

        const swabTestCode = `AI ${swabTestOrder}/1`;

        if (recordData[8].trim() != '-') {
          if (swabEnvironments[recordData[8].trim()]) {
            swabEnvironmentsData.push(swabEnvironments[recordData[8].trim()]);
          } else {
            console.log(
              'Missing swab environment at 8',
              swabTestCode,
              recordData[8].trim(),
            );
          }
        }

        if (recordData[9].trim() != '-') {
          if (swabEnvironments[recordData[9].trim()]) {
            swabEnvironmentsData.push(swabEnvironments[recordData[9].trim()]);
          } else {
            console.log(
              'Missing swab environment at 9',
              swabTestCode,
              recordData[9].trim(),
            );
          }
        }

        if (recordData[10].trim() != '-') {
          if (swabEnvironments[recordData[10].trim()]) {
            swabEnvironmentsData.push(swabEnvironments[recordData[10].trim()]);
          } else {
            console.log(
              'Missing swab environment at 10',
              swabTestCode,
              recordData[10].trim(),
            );
          }
        }

        if (recordData[11].trim() != '-') {
          if (swabEnvironments[recordData[11].trim()]) {
            swabEnvironmentsData.push(swabEnvironments[recordData[11].trim()]);
          } else {
            console.log(
              'Missing swab environment at 11',
              swabTestCode,
              recordData[11].trim(),
            );
          }
        }

        if (recordData[12].trim() != '-') {
          if (swabEnvironments[recordData[12].trim()]) {
            swabEnvironmentsData.push(swabEnvironments[recordData[12].trim()]);
          } else {
            console.log(
              'Missing swab environment at 12',
              swabTestCode,
              recordData[12].trim(),
            );
          }
        }

        const swabTestData = SwabTest.create({
          swabTestCode,
          swabTestRecordedAt,
          bacteria: bacteriasData,
          bacteriaSpecies: bacteriaSpeciesData,
          swabRound: targetSwabRound,
          swabTestOrder,
        });

        const historyData = {
          swabAreaDate: swabAreaDateData,
          swabAreaSwabedAt,
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

        const swabAreaHistory = SwabAreaHistory.create(historyData);

        await queryRunnerManger.save(swabAreaHistory);
      }
    });
  }
}
