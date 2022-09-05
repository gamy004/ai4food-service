import { Injectable } from '@nestjs/common';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { FindOptionsWhere, In, IsNull, Not } from 'typeorm';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { SwabTest } from '../entities/swab-test.entity';
import { ParamLabSwabPlanByIdDto } from '../dto/param-lab-swab-plan-by-id.dto';
import { SwabAreaHistoryService } from './swab-area-history.service';
import { SwabPeriod } from '../entities/swab-period.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { ResponseQueryLabSwabPlanDto } from '../dto/response-query-lab-swab-plan.dto';
import { SwabAreaService } from './swab-area.service';
import { FacilityItemService } from '~/facility/facility-item.service';
import { FacilityService } from '~/facility/facility.service';
import { SwabPeriodService } from './swab-period.service';

export const DEFAULT_RELATIONS = {
  swabTest: {
    bacteria: true,
    bacteriaSpecies: true,
  },
  // swabArea: {
  //   facility: true,
  // },
  // facilityItem: true,
  // swabPeriod: true,
};

export const DEFAULT_SELECT = {
  id: true,
  shift: true,
  swabAreaDate: true,
  swabAreaSwabedAt: true,
  swabTestId: true,
  swabTest: {
    id: true,
    swabTestCode: true,
    swabTestRecordedAt: true,
    bacteria: {
      id: true,
      bacteriaName: true,
    },
    bacteriaSpecies: {
      id: true,
      bacteriaSpecieName: true,
    },
  },
  swabAreaId: true,
  facilityItemId: true,
  swabPeriodId: true,
  // swabArea: {
  //   id: true,
  //   swabAreaName: true,
  //   facility: {
  //     id: true,
  //     facilityName: true,
  //   },
  // },
  // facilityItem: {
  //   id: true,
  //   facilityItemName: true,
  // },
  // swabPeriod: {
  //   id: true,
  //   swabPeriodName: true,
  // },
};

@Injectable()
export class SwabLabQueryService {
  constructor(
    private readonly swabAreaHistoryService: SwabAreaHistoryService,
    private readonly swabAreaService: SwabAreaService,
    private readonly swabPeriodService: SwabPeriodService,
    private readonly facilityItemService: FacilityItemService,
    private readonly facilityService: FacilityService,
  ) {}

  async queryLabSwabPlan(
    queryLabSwabPlanDto: QueryLabSwabPlanDto,
  ): Promise<ResponseQueryLabSwabPlanDto> {
    const where: FindOptionsWhere<SwabAreaHistory> =
      this.swabAreaHistoryService.toFilter(queryLabSwabPlanDto);

    const result = await this.swabAreaHistoryService.find({
      where: {
        ...where,
        swabAreaSwabedAt: Not(IsNull()),
        swabTestId: Not(IsNull()),
      },
      relations: {
        ...DEFAULT_RELATIONS,
      },
      select: {
        ...DEFAULT_SELECT,
      },
      order: {
        swabTest: {
          id: {
            direction: 'asc',
          },
        },
      },
    });

    let swabPeriods = [];
    let swabAreaHistories = [];
    let swabTests = [];
    let swabAreas = [];
    let facilities = [];
    let facilityitems = [];

    if (result.length) {
      let swabAreaIds = [];
      let swabPeriodIds = [];
      let facilityIds = [];
      let facilityItemIds = [];

      result.forEach((record) => {
        const {
          swabTest,
          swabAreaId,
          swabPeriodId,
          facilityItemId,
          ...otherProps
        } = record;

        swabTests.push(swabTest);
        swabAreaIds.push(swabAreaId);
        swabPeriodIds.push(swabPeriodId);
        facilityItemIds.push(facilityItemId);

        swabAreaHistories.push(
          this.swabAreaHistoryService.make({
            ...otherProps,
            swabAreaId,
            swabPeriodId,
            facilityItemId,
          }),
        );
      });

      swabAreaIds = [...new Set(swabAreaIds.filter(Boolean))];

      facilityItemIds = [...new Set(facilityItemIds.filter(Boolean))];

      if (swabAreaIds.length) {
        swabAreas = await this.swabAreaService.find({
          where: { id: In(swabAreaIds) },
          select: { id: true, swabAreaName: true, facilityId: true },
        });

        if (swabAreas.length) {
          swabAreas.forEach((swabArea) => {
            const { facilityId } = swabArea;

            facilityIds.push(facilityId);
          });
        }
      }

      if (swabPeriodIds.length) {
        swabPeriods = await this.swabPeriodService.find({
          where: { id: In(swabPeriodIds) },
          select: { id: true, swabPeriodName: true },
        });
      }

      if (facilityItemIds.length) {
        facilityitems = await this.facilityItemService.find({
          where: { id: In(facilityItemIds) },
          select: { id: true, facilityItemName: true, facilityId: true },
        });

        if (facilityitems.length) {
          facilityitems.forEach((facilityItem) => {
            const { facilityId } = facilityItem;

            facilityIds.push(facilityId);
          });
        }
      }

      facilityIds = [...new Set(facilityIds.filter(Boolean))];

      if (facilityIds.length) {
        facilities = await this.facilityService.find({
          where: { id: In(facilityIds) },
          select: { id: true, facilityName: true, facilityType: true },
        });
      }
    }

    return {
      swabAreaHistories,
      swabTests,
      swabAreas,
      swabPeriods,
      facilities,
      facilityitems,
    };
  }

  private async transformParamLabSwabPlanByIdDto(
    paramLabSwabPlanByIdDto: ParamLabSwabPlanByIdDto,
  ): Promise<FindOptionsWhere<SwabAreaHistory>> {
    let { id } = paramLabSwabPlanByIdDto;

    const whereSwabAreaHistory: FindOptionsWhere<SwabAreaHistory> = {
      swabTestId: Not(IsNull()),
      id,
    };

    return whereSwabAreaHistory;
  }

  async queryLabSwabPlanById(
    paramLabSwabPlanByIdDto: ParamLabSwabPlanByIdDto,
  ): Promise<SwabAreaHistory> {
    const where: FindOptionsWhere<SwabAreaHistory> =
      await this.transformParamLabSwabPlanByIdDto(paramLabSwabPlanByIdDto);

    return await this.swabAreaHistoryService.findOneOrFail({
      where,
      relations: {
        ...DEFAULT_RELATIONS,
      },
      select: {
        ...DEFAULT_SELECT,
      },
    });
  }
}
