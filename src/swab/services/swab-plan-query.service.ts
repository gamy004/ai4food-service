import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabPeriodService } from './swab-period.service';
import { FindOptionsWhere, In, IsNull, Not, Raw, Repository } from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityService } from '~/facility/facility.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';

@Injectable()
export class SwabPlanQueryService {
  constructor(
    private readonly dateTransformer: DateTransformer,
    protected readonly facilityService: FacilityService,
    protected readonly swabPeriodService: SwabPeriodService,
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

  async querySwabPlan(
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

    // if (!swabPeriod.dependsOnShift) {
    //   shift = null;
    // }

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
