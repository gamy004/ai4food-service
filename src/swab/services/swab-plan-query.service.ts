import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabPeriodService } from './swab-period.service';
import {
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Raw,
  Repository,
} from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityService } from '~/facility/services/facility.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { SwabAreaHistoryService } from './swab-area-history.service';
import { ResponseQueryUpdateSwabPlanV2Dto } from '../dto/response-query-update-swab-plan-v2.dto';
import { FacilityItemService } from '~/facility/services/facility-item.service';
import { QueryUpdateSwabPlanV2Dto } from '../dto/query-update-swab-plan-v2.dto';
import { SwabProductHistoryService } from './swab-product-history.service';
import { SwabProductHistory } from '../entities/swab-product-history.entity';
import { ProductService } from '~/product/services/product.service';
import { SwabStatus } from '../entities/swab-test.entity';
import { QueryExportSwabHistoryDto } from '../dto/query-export-swab-history.dto';

@Injectable()
export class SwabPlanQueryService {
  constructor(
    private readonly dateTransformer: DateTransformer,
    private readonly facilityService: FacilityService,
    private readonly facilityItemService: FacilityItemService,
    private readonly swabPeriodService: SwabPeriodService,
    private readonly swabAreaHistoryService: SwabAreaHistoryService,
    private readonly swabProductHistoryService: SwabProductHistoryService,
    private readonly productService: ProductService,
    @InjectRepository(SwabAreaHistory)
    private readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabProductHistory)
    private readonly swabProductHistoryRepository: Repository<SwabProductHistory>,
    @InjectRepository(SwabArea)
    private readonly swabAreaRepository: Repository<SwabArea>,
  ) {}

  // private transformQuerySwabPlanDto(
  //   querySwabPlanDto: QuerySwabPlanDto,
  // ): FindOptionsWhere<SwabAreaHistory> {
  //   const { fromDate, toDate: toDateString, hasBacteria } = querySwabPlanDto;

  //   const where: FindOptionsWhere<SwabAreaHistory> = {};
  //   const whereSwabTest: FindOptionsWhere<SwabTest> = {};
  //   const whereBacteria: FindOptionsWhere<Bacteria> = {};

  //   let toDate;

  //   if (toDateString) {
  //     toDate = this.dateTransformer.toObject(toDateString);

  //     toDate.setDate(toDate.getDate() + 1);

  //     toDate = this.dateTransformer.toString(toDate);
  //   }

  //   if (fromDate && toDate) {
  //     where.swabAreaDate = Raw(
  //       (field) => `${field} >= '${fromDate}' and ${field} < '${toDate}'`,
  //     );
  //   } else {
  //     if (fromDate) {
  //       where.swabAreaDate = Raw((field) => `${field} >= '${fromDate}'`);
  //     }

  //     if (toDate) {
  //       where.swabAreaDate = Raw((field) => `${field} < '${toDate}'`);
  //     }
  //   }

  //   if (hasBacteria !== undefined) {
  //     whereBacteria.id = hasBacteria === true ? Not(IsNull()) : IsNull();
  //   }

  //   if (Object.keys(whereBacteria).length) {
  //     whereSwabTest.bacteria = whereBacteria;
  //   }

  //   if (Object.keys(whereSwabTest).length) {
  //     where.swabTest = whereSwabTest;
  //   }

  //   return where;
  // }

  // private transformQuerySwabProductDto(
  //   querySwabPlanDto: QuerySwabPlanDto,
  // ): FindOptionsWhere<SwabProductHistory> {
  //   const { fromDate, toDate: toDateString } = querySwabPlanDto;

  //   const where: FindOptionsWhere<SwabProductHistory> = {};

  //   let toDate;

  //   if (toDateString) {
  //     toDate = this.dateTransformer.toObject(toDateString);

  //     toDate.setDate(toDate.getDate() + 1);

  //     toDate = this.dateTransformer.toString(toDate);
  //   }

  //   if (fromDate && toDate) {
  //     where.swabProductDate = Raw(
  //       (field) => `${field} >= '${fromDate}' and ${field} < '${toDate}'`,
  //     );
  //   } else {
  //     if (fromDate) {
  //       where.swabProductDate = Raw((field) => `${field} >= '${fromDate}'`);
  //     }

  //     if (toDate) {
  //       where.swabProductDate = Raw((field) => `${field} < '${toDate}'`);
  //     }
  //   }

  //   return where;
  // }

  async queryExportSwabPlan(
    queryExportSwabHistoryDto: QueryExportSwabHistoryDto,
  ): Promise<ResponseSwabPlanDto> {
    console.log(queryExportSwabHistoryDto);

    // const { fromDate, toDate, bacteriaSpecies, swabStatus } = querySwabPlanDto;

    // const whereSwabAreaHistory: FindOptionsWhere<SwabAreaHistory> =
    //   this.swabAreaHistoryService.toFilter({ fromDate, toDate });

    // const whereSwabProductHistory: FindOptionsWhere<SwabProductHistory> =
    //   this.swabProductHistoryService.toFilter({ fromDate, toDate });

    // const relationsSwabAreaHistory: FindOptionsRelations<SwabAreaHistory> = {
    //   swabTest: {
    //     bacteria: true,
    //   },
    // };
    // const relationsSwabProductHistory: FindOptionsRelations<SwabProductHistory> =
    //   {
    //     swabTest: {
    //       bacteria: true,
    //     },
    //   };

    // if (querySwabPlanDto.bacteriaSpecies) {
    //   relationsSwabAreaHistory.swabTest = {
    //     bacteria: true,
    //     bacteriaSpecies: true,
    //   };

    //   relationsSwabProductHistory.swabTest = {
    //     bacteria: true,
    //     bacteriaSpecies: true,
    //   };
    // }

    // const swabAreaHistories = await this.swabAreaHistoryRepository.find({
    //   relations: {
    //     swabTest: {
    //       bacteria: true,
    //     },
    //   },
    //   where: {
    //     swabTest: {
    //       id: Not(IsNull()),
    //     },
    //   },
    // });

    const swabAreaHistoryQuery = this.swabAreaHistoryService
      .toQuery(queryExportSwabHistoryDto)
      .andWhere('swab_test.id IS NOT NULL');

    const [swabAreaHistories, totalSwabAreaHistories] =
      await swabAreaHistoryQuery
        .orderBy('swab_test.id', 'ASC')
        .getManyAndCount();

    // const swabAreaHistories = await this.swabAreaHistoryRepository.find({
    //   where: {
    //     ...whereSwabAreaHistory,
    //     swabTestId: Not(IsNull()),
    //   },
    //   relations: relationsSwabAreaHistory,
    //   select: {
    //     id: true,
    //     swabAreaDate: true,
    //     swabPeriodId: true,
    //     swabAreaId: true,
    //     shift: true,
    //     swabTestId: true,
    //     swabTest: {
    //       id: true,
    //       swabTestCode: true,
    //       swabTestRecordedAt: true,
    //       bacteria: {
    //         id: true,
    //       },
    //       bacteriaSpecies: {
    //         id: true,
    //         bacteriaId: true,
    //       },
    //     },
    //   },
    //   order: {
    //     swabTest: {
    //       id: {
    //         direction: 'asc',
    //       },
    //     },
    //   },
    // });

    const swabProductHistoryQuery = this.swabProductHistoryService
      .toQuery(queryExportSwabHistoryDto)
      .andWhere('swab_test.id IS NOT NULL');

    const [swabProductHistories, totalSwabProductHistories] =
      await swabProductHistoryQuery
        .orderBy('swab_test.id', 'ASC')
        .getManyAndCount();

    // let swabProductHistoryQuery = this.swabProductHistoryRepository
    //   .createQueryBuilder('swabProductHistory')
    //   .innerJoinAndSelect('swabProductHistory.swabTest', 'swab_test')
    //   .leftJoinAndSelect('swab_test.bacteria', 'bacteria')
    //   .where('swab_test.id IS NOT NULL');

    // if (fromDate || toDate) {
    //   swabProductHistoryQuery.andWhere(
    //     this.dateTransformer.dateRangeToSql(
    //       'swabProductHistory.swabProductDate',
    //       fromDate,
    //       toDate,
    //     ),
    //   );
    // }

    // if (bacteriaSpecies) {
    //   swabProductHistoryQuery.leftJoinAndSelect(
    //     'swab_test.bacteriaSpecies',
    //     'bacteria_specie',
    //   );
    // }

    // switch (swabStatus) {
    //   case SwabStatus.PENDING:
    //     swabProductHistoryQuery.andWhere(
    //       `swab_test.swabTestRecordedAt IS NULL`,
    //     );
    //     break;

    //   case SwabStatus.NORMAL:
    //     swabProductHistoryQuery
    //       .andWhere(`swab_test.swabTestRecordedAt IS NOT NULL`)
    //       .andWhere(`bacteria.id IS NULL`);
    //     break;

    //   case SwabStatus.DETECTED:
    //     swabProductHistoryQuery
    //       .andWhere(`swab_test.swabTestRecordedAt IS NOT NULL`)
    //       .andWhere(`bacteria.id IS NOT NULL`);
    //     break;

    //   default:
    //     break;
    // }

    // const swabProductHistories = await swabProductHistoryQuery
    //   .orderBy('swab_test.id', 'ASC')
    //   .getMany();

    // let swabPeriodMapping = {};
    // let swabPeriods = [];
    // let facilities = [];
    // let products = [];
    // let swabAreas = [];

    // if (swabAreaHistories.length) {
    //   swabAreaHistories.forEach(
    //     ({ swabPeriodId }) => (swabPeriodMapping[swabPeriodId] = true),
    //   );

    //   const swabAreaIds = [
    //     ...new Set(swabAreaHistories.map(({ swabAreaId }) => swabAreaId)),
    //   ].filter(Boolean);

    //   if (swabAreaIds.length) {
    //     swabAreas = await this.swabAreaRepository.find({
    //       where: {
    //         id: In(swabAreaIds),
    //       },
    //       select: {
    //         id: true,
    //         swabAreaName: true,
    //         mainSwabAreaId: true,
    //         facilityId: true,
    //       },
    //     });
    //   }

    //   if (swabAreas.length) {
    //     const facilityIds = [
    //       ...new Set(swabAreas.map(({ facilityId }) => facilityId)),
    //     ].filter(Boolean);

    //     if (facilityIds.length) {
    //       facilities = await this.facilityService.find({
    //         where: {
    //           id: In(facilityIds),
    //         },
    //         select: {
    //           id: true,
    //           facilityName: true,
    //           facilityType: true,
    //         },
    //         order: {
    //           facilityType: 'asc',
    //           facilityName: 'asc',
    //         },
    //       });
    //     }
    //   }
    // }

    // if (swabProductHistories.length) {
    //   swabProductHistories.forEach(
    //     ({ swabPeriodId }) => (swabPeriodMapping[swabPeriodId] = true),
    //   );

    //   const productIds = [
    //     ...new Set(swabProductHistories.map(({ productId }) => productId)),
    //   ].filter(Boolean);

    //   if (productIds.length) {
    //     products = await this.productService.find({
    //       where: {
    //         id: In(productIds),
    //       },
    //       select: {
    //         id: true,
    //         productName: true,
    //         productCode: true,
    //         alternateProductCode: true,
    //       },
    //     });
    //   }
    // }

    // const swabPeriodIds = Object.keys(swabPeriodMapping).filter(Boolean);

    // if (swabPeriodIds.length) {
    //   swabPeriods = await this.swabPeriodService.find({
    //     where: {
    //       id: In(swabPeriodIds),
    //     },
    //     select: {
    //       id: true,
    //       swabPeriodName: true,
    //     },
    //   });
    // }

    return {
      // swabPeriods,
      // swabAreas,
      // products,
      // facilities,
      swabAreaHistories,
      swabProductHistories,
      totalSwabAreaHistories,
      totalSwabProductHistories,
    };
  }

  private async transformQueryUpdateSwabPlanDto(
    querySwabPlanDto: QueryUpdateSwabPlanDto,
  ): Promise<FindOptionsWhere<SwabAreaHistory>[]> {
    let {
      swabAreaDate: swabAreaDateString,
      shift,
      facilityId,
      swabAreaId,
      swabPeriodId,
    } = querySwabPlanDto;

    let swabAreaDate = this.dateTransformer.toObject(swabAreaDateString);

    // const swabPeriod = await this.swabPeriodService.findOneBy({
    //   id: swabPeriodId,
    // });

    const where: FindOptionsWhere<SwabAreaHistory>[] = [
      {
        swabAreaDate,
        shift,
        swabPeriodId,
        swabArea: {
          id: swabAreaId,
          facilityId,
        },
      },
      {
        swabAreaDate,
        shift,
        swabPeriodId,
        swabArea: {
          mainSwabAreaId: swabAreaId,
          facilityId,
        },
      },
    ];

    return where;
  }

  async queryUpdateSwabPlan(
    queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto,
  ): Promise<SwabAreaHistory[]> {
    const where: FindOptionsWhere<SwabAreaHistory>[] =
      await this.transformQueryUpdateSwabPlanDto(queryUpdateSwabPlanDto);

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        swabTest: true,
        swabArea: true,
        swabAreaHistoryImages: {
          file: true,
        },
        swabEnvironments: true,
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabAreaSwabedAt: true,
        swabPeriodId: true,
        swabAreaId: true,
        shift: true,
        swabAreaTemperature: true,
        swabAreaHumidity: true,
        swabTestId: true,
        facilityItemId: true,
        productDate: true,
        productLot: true,
        productId: true,
        swabArea: {
          id: true,
          swabAreaName: true,
          facilityId: true,
          mainSwabAreaId: true,
        },
        swabTest: {
          id: true,
          swabTestCode: true,
          swabTestRecordedAt: true,
        },
        swabAreaHistoryImages: {
          id: true,
          swabAreaHistoryId: true,
          file: {
            id: true,
            fileKey: true,
            fileSource: true,
          },
        },
        swabEnvironments: {
          id: true,
          swabEnvironmentName: true,
        },
      },
      order: {
        swabTest: {
          id: {
            direction: 'asc',
          },
        },
      },
    });

    return swabAreaHistories;
  }

  private async transformQueryUpdateSwabPlanV2Dto(
    querySwabPlanDto: QueryUpdateSwabPlanV2Dto,
  ): Promise<FindOptionsWhere<SwabAreaHistory>> {
    let { swabAreaDate, shift, facilityId, swabAreaId, swabPeriodId } =
      querySwabPlanDto;

    const where: FindOptionsWhere<SwabAreaHistory> =
      this.swabAreaHistoryService.toFilter({
        swabAreaId,
        swabAreaDate,
        shift,
        facilityId,
        swabPeriodId,
      });

    return where;
  }

  async queryUpdateSwabPlanV2(
    queryUpdateSwabPlanDto: QueryUpdateSwabPlanV2Dto,
  ): Promise<ResponseQueryUpdateSwabPlanV2Dto> {
    const where: FindOptionsWhere<SwabAreaHistory> =
      await this.transformQueryUpdateSwabPlanV2Dto(queryUpdateSwabPlanDto);

    const params: FindManyOptions<SwabAreaHistory> = {
      where: {
        ...where,
        swabTestId: Not(IsNull()),
      },
      relations: {
        swabTest: true,
        swabAreaHistoryImages: {
          file: true,
        },
        swabEnvironments: true,
      },
      // select: {
      //   id: true,
      //   swabAreaDate: true,
      //   swabAreaSwabedAt: true,
      //   swabPeriodId: true,
      //   swabAreaId: true,
      //   shift: true,
      //   swabTestId: true,
      //   facilityItemId: true,
      //   productDate: true,
      //   productId: true,
      //   swabAreaHistoryImages: {
      //     id: true,
      //     swabAreaHistoryId: true,
      //     createdAt: true,
      //     file: {
      //       id: true,
      //       fileKey: true,
      //       fileSource: true,
      //     },
      //   },
      //   swabEnvironments: {
      //     id: true,
      //     swabEnvironmentName: true,
      //   },
      //   swabTest: {
      //     id: true,
      //     swabTestCode: true,
      //   },
      // },
      order: {
        swabTest: {
          id: {
            direction: 'asc',
          },
        },
      },
    };

    const paginationParams: FindManyOptions<SwabAreaHistory> = {};

    if (queryUpdateSwabPlanDto.skip !== undefined) {
      paginationParams.skip = queryUpdateSwabPlanDto.skip;
    }

    if (queryUpdateSwabPlanDto.take !== undefined) {
      paginationParams.take = queryUpdateSwabPlanDto.take;
    }

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      ...params,
      ...paginationParams,
    });

    let total;

    if (paginationParams.skip || paginationParams.take) {
      total = await this.swabAreaHistoryRepository.count(params);
    } else {
      total = swabAreaHistories.length;
    }

    let facilities = [];
    let facilityItems = [];
    let swabAreas = [];
    let subSwabAreaHistories = [];

    if (swabAreaHistories.length) {
      let facilityIds = [];

      const swabAreaIds = [
        ...new Set(swabAreaHistories.map(({ swabAreaId }) => swabAreaId)),
      ].filter(Boolean);

      const facilityitemIds = [
        ...new Set(
          swabAreaHistories.map(({ facilityItemId }) => facilityItemId),
        ),
      ].filter(Boolean);

      if (swabAreaIds.length) {
        swabAreas = await this.swabAreaRepository.find({
          where: {
            id: In(swabAreaIds),
          },
          select: {
            id: true,
            swabAreaName: true,
            mainSwabAreaId: true,
            facilityId: true,
          },
        });

        const subSwabAreas = await this.swabAreaRepository.find({
          where: {
            mainSwabAreaId: In(swabAreaIds),
          },
          select: {
            id: true,
            swabAreaName: true,
            mainSwabAreaId: true,
            facilityId: true,
          },
        });

        if (subSwabAreas.length) {
          swabAreas = [...swabAreas, ...subSwabAreas];

          const subSwabAreaIds = [
            ...new Set(subSwabAreas.map(({ id }) => id)),
          ].filter(Boolean);

          subSwabAreaHistories = await this.swabAreaHistoryRepository.find({
            where: {
              ...where,
              swabAreaId: In(subSwabAreaIds),
            },
            relations: {
              swabEnvironments: true,
            },
          });
        }

        // console.log(subSwabAreaHistories);

        if (swabAreas.length) {
          facilityIds = [
            ...facilityIds,
            ...new Set(swabAreas.map(({ facilityId }) => facilityId)),
          ].filter(Boolean);
        }
      }

      if (facilityitemIds.length) {
        facilityItems = await this.facilityItemService.find({
          where: {
            id: In(facilityitemIds),
          },
          select: {
            id: true,
            facilityItemName: true,
            facilityId: true,
          },
        });

        if (facilityItems.length) {
          facilityIds = [
            ...facilityIds,
            ...new Set(facilityItems.map(({ facilityId }) => facilityId)),
          ].filter(Boolean);
        }
      }

      facilityIds = [...new Set(facilityIds)].filter(Boolean);

      if (facilityIds.length) {
        facilities = await this.facilityService.find({
          where: {
            id: In(facilityIds),
          },
          select: {
            id: true,
            facilityName: true,
            facilityType: true,
          },
          order: {
            facilityType: 'asc',
            facilityName: 'asc',
          },
        });
      }
    }

    return {
      total,
      swabAreaHistories,
      subSwabAreaHistories,
      swabAreas,
      facilities,
      facilityItems,
    };
  }

  async queryUpdateSwabPlanById(
    queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto,
  ): Promise<SwabAreaHistory> {
    const where: FindOptionsWhere<SwabAreaHistory> = {
      id: queryUpdateSwabPlanByIdDto.id,
    };

    const swabAreaHistory = await this.swabAreaHistoryRepository.findOne({
      where,
      relations: {
        swabTest: true,
        swabArea: {
          facility: true,
          subSwabAreas: true,
        },
        swabPeriod: true,
        swabAreaHistoryImages: {
          file: true,
        },
        swabEnvironments: true,
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabAreaSwabedAt: true,
        swabPeriodId: true,
        swabAreaId: true,
        shift: true,
        swabAreaTemperature: true,
        swabAreaHumidity: true,
        swabAreaAtp: true,
        swabAreaNote: true,
        productId: true,
        productLot: true,
        productDate: true,
        facilityItemId: true,
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true,
        },
        swabArea: {
          id: true,
          swabAreaName: true,
          facilityId: true,
          mainSwabAreaId: true,
          facility: {
            id: true,
            facilityName: true,
          },
        },
        swabPeriod: {
          id: true,
          swabPeriodName: true,
        },
        swabAreaHistoryImages: {
          id: true,
          swabAreaHistoryId: true,
          createdAt: true,
          file: {
            id: true,
            fileKey: true,
            fileSource: true,
          },
        },
        swabEnvironments: {
          id: true,
          swabEnvironmentName: true,
        },
      },
      order: {
        swabAreaHistoryImages: {
          createdAt: {
            direction: 'desc',
          },
        },
      },
    });

    return swabAreaHistory;
  }
}
