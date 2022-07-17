import { format } from 'date-fns-tz';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, IsNull, Not, Raw, Repository } from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabPeriodService } from './swab-period.service';
import { FacilityItemService } from '~/facility/facility-item.service';

@Injectable()
export class SwabService {
  constructor(

    protected readonly facilityItemService: FacilityItemService,
    protected readonly swabPeriodService: SwabPeriodService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>
  ) { }

  async querySwabPlan(querySwabPlanDto: QuerySwabPlanDto): Promise<ResponseSwabPlanDto> {
    const { fromDate: fromDateString, toDate: toDateString } = querySwabPlanDto;

    const where: FindOptionsWhere<SwabAreaHistory> = {};

    let fromDate, toDate;

    if (fromDateString) {
      fromDate = new Date(fromDateString);

      fromDate.setMinutes(0, 0, 0);

      fromDate = format(fromDate, "yyyy-MM-dd");
      // console.log("Before:", fromDate);

      // fromDate = utcToZonedTime(fromDate, 'Asia/Bangkok');

      // console.log("After:", fromDate);
    }

    if (toDateString) {
      toDate = new Date(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate.setMinutes(0, 0, 0);

      toDate = format(toDate, "yyyy-MM-dd");

      // toDate = utcToZonedTime(toDate, 'Asia/Bangkok');
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

    const swabPeriods = await this.swabPeriodService.findAll();

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
        swabAreas = await this.swabAreaRepository.findBy({
          id: In(swabAreaIds)
        });
      }

      if (swabAreas.length) {
        let mainSwabAreas = [];

        const facilityItemIds = [...new Set(swabAreas.map(({ facilityItemId }) => facilityItemId))].filter(Boolean);

        if (facilityItemIds.length) {
          facilityItems = await this.facilityItemService.find({
            id: In(facilityItemIds)
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
}

