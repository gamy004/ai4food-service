import { format } from 'date-fns-tz';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabTest } from '../entities/swab-test.entity';
import { SwabPeriodService } from './swab-period.service';
import { FindOptionsWhere, In, IsNull, Not, Raw, Repository } from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityItemService } from '~/facility/facility-item.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { SwabEnvironment } from '../entities/swab-environment.entity';
import { SwabAreaHistoryImage } from '../entities/swab-area-history-image.entity';

@Injectable()
export class SwabPlanQueryService {
  constructor(

    protected readonly facilityItemService: FacilityItemService,
    protected readonly swabPeriodService: SwabPeriodService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>,

  ) { }

  private transformQuerySwabPlanDto(querySwabPlanDto: QuerySwabPlanDto): FindOptionsWhere<SwabAreaHistory> {
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

  async querySwabPlan(querySwabPlanDto: QuerySwabPlanDto): Promise<ResponseSwabPlanDto> {
    const where: FindOptionsWhere<SwabAreaHistory> = this.transformQuerySwabPlanDto(
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

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        swabTest: true,
        swabArea: true,
        swabAreaHistoryImages: true
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
        swabTest: {
          id: true,
          swabTestCode: true,
        },
        swabAreaHistoryImages: {
          id: true,
          swabAreaHistoryImageUrl: true,
          swabAreaHistoryId: true
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

    return swabAreaHistories;
  }

  async queryUpdateSwabPlanById(queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto): Promise<SwabAreaHistory> {
    const where: FindOptionsWhere<SwabAreaHistory> = {
      id: queryUpdateSwabPlanByIdDto.id
    };

    const swabAreaHistory = await this.swabAreaHistoryRepository.findOne({
      where,
      relations: {
        swabTest: true,
        swabArea: {
          facilityItem: true
        },
        swabPeriod: true,
        swabAreaHistoryImages: true,
        swabEnvironments: true
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
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true,
        },
        swabArea: {
          id: true,
          swabAreaName: true,
          facilityItemId: true,
          facilityItem: {
            id: true,
            facilityItemName: true
          }
        },
        swabPeriod: {
          id: true,
          swabPeriodName: true
        },
        swabAreaHistoryImages: {
          id: true,
          swabAreaHistoryImageUrl: true,
          swabAreaHistoryId: true
        },
        swabEnvironments: {
          id: true,
          swabEnvironmentName: true
        }
      }
    });

    return swabAreaHistory;
  }

  private async transformLabSwabPlanDto(queryLabSwabPlanDto: QueryLabSwabPlanDto): Promise<FindOptionsWhere<SwabAreaHistory>> {
    let { swabAreaDate: swabAreaDateString, swabTestCode, listeriaMonoDetected } = queryLabSwabPlanDto;

    const whereSwabTest: FindOptionsWhere<SwabTest> = {
      swabTestCode,
      listeriaMonoDetected: IsNull()
    };

    const whereSwabAreaHistory: FindOptionsWhere<SwabAreaHistory> = {};

    if (swabAreaDateString) {
      let swabAreaDate = new Date(swabAreaDateString);

      swabAreaDate.setMinutes(0, 0, 0);

      whereSwabAreaHistory.swabAreaDate = swabAreaDate;
    }

    if (listeriaMonoDetected !== undefined) {
      whereSwabTest.listeriaMonoDetected = listeriaMonoDetected;
    }

    whereSwabAreaHistory.swabTest = whereSwabTest;

    return whereSwabAreaHistory;
  }

  async queryLabSwabPlan(queryLabSwabPlanDto: QueryLabSwabPlanDto): Promise<SwabAreaHistory[]> {
    const where: FindOptionsWhere<SwabAreaHistory> = await this.transformLabSwabPlanDto(
      queryLabSwabPlanDto
    );

    return await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        swabTest: true,
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true,
          listeriaMonoDetected: true,
          listeriaMonoValue: true,
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

}
