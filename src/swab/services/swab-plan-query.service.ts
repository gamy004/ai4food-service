import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabPeriodService } from './swab-period.service';
import {
  FindManyOptions,
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
import { FacilityService } from '~/facility/facility.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { SwabAreaHistoryService } from './swab-area-history.service';
import { ResponseQueryUpdateSwabPlanV2Dto } from '../dto/response-query-update-swab-plan-v2.dto';
import { FacilityItemService } from '~/facility/facility-item.service';
import { QueryUpdateSwabPlanV2Dto } from '../dto/query-update-swab-plan-v2.dto';

@Injectable()
export class SwabPlanQueryService {
  constructor(
    private readonly dateTransformer: DateTransformer,
    protected readonly facilityService: FacilityService,
    protected readonly facilityItemService: FacilityItemService,
    protected readonly swabPeriodService: SwabPeriodService,
    protected readonly swabAreaHistoryService: SwabAreaHistoryService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,
  ) {}

  private transformQuerySwabPlanDto(
    querySwabPlanDto: QuerySwabPlanDto,
  ): FindOptionsWhere<SwabAreaHistory> {
    const { fromDate, toDate: toDateString } = querySwabPlanDto;

    const where: FindOptionsWhere<SwabAreaHistory> = {};

    let toDate;

    if (toDateString) {
      toDate = this.dateTransformer.toObject(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate = this.dateTransformer.toString(toDate);
    }

    if (fromDate && toDate) {
      where.swabAreaDate = Raw(
        (field) => `${field} >= '${fromDate}' and ${field} < '${toDate}'`,
      );
    } else {
      if (fromDate) {
        where.swabAreaDate = Raw((field) => `${field} >= '${fromDate}'`);
      }

      if (toDate) {
        where.swabAreaDate = Raw((field) => `${field} < '${toDate}'`);
      }
    }

    return where;
  }

  async queryExportSwabPlan(
    querySwabPlanDto: QuerySwabPlanDto,
  ): Promise<ResponseSwabPlanDto> {
    const where: FindOptionsWhere<SwabAreaHistory> =
      this.transformQuerySwabPlanDto(querySwabPlanDto);

    const swabPeriods = await this.swabPeriodService.find({
      select: {
        id: true,
        swabPeriodName: true,
      },
    });

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      where: {
        ...where,
        swabTestId: Not(IsNull()),
      },
      relations: {
        swabTest: true,
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
          swabTestCode: true,
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

    let facilities = [];
    let swabAreas = [];

    if (swabAreaHistories.length) {
      const swabAreaIds = [
        ...new Set(swabAreaHistories.map(({ swabAreaId }) => swabAreaId)),
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
      }

      if (swabAreas.length) {
        const facilityIds = [
          ...new Set(swabAreas.map(({ facilityId }) => facilityId)),
        ].filter(Boolean);

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
    }
    return {
      swabPeriods,
      swabAreaHistories,
      swabAreas,
      facilities,
    };
  }

  private async transformQueryUpdateSwabPlanDto(
    querySwabPlanDto: QueryUpdateSwabPlanDto,
  ): Promise<FindOptionsWhere<SwabAreaHistory>[]> {
    let {
      swabAreaDate: swabAreaDateString,
      shift,
      facilityId,
      mainSwabAreaId,
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
          id: mainSwabAreaId,
          facilityId,
        },
      },
      {
        swabAreaDate,
        shift,
        swabPeriodId,
        swabArea: {
          mainSwabAreaId,
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
    let { swabAreaDate, shift, facilityId, mainSwabAreaId, swabPeriodId } =
      querySwabPlanDto;

    const where: FindOptionsWhere<SwabAreaHistory> =
      this.swabAreaHistoryService.toFilter({
        swabAreaId: mainSwabAreaId,
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

    if (queryUpdateSwabPlanDto.skip) {
      paginationParams.skip = queryUpdateSwabPlanDto.skip;
    }

    if (queryUpdateSwabPlanDto.take) {
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
