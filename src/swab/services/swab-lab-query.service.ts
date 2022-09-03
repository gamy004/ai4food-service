import { Injectable } from '@nestjs/common';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { SwabTest } from '../entities/swab-test.entity';
import { ParamLabSwabPlanByIdDto } from '../dto/param-lab-swab-plan-by-id.dto';
import { SwabAreaHistoryService } from './swab-area-history.service';
import { SwabPeriod } from '../entities/swab-period.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';

export const DEFAULT_RELATIONS = {
  swabTest: {
    bacteria: true,
  },
  swabArea: {
    facility: true,
  },
  facilityItem: true,
  swabPeriod: true,
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
  },
  swabArea: {
    id: true,
    swabAreaName: true,
    facility: {
      id: true,
      facilityName: true,
    },
  },
  facilityItem: {
    id: true,
    facilityItemName: true,
  },
  swabPeriod: {
    id: true,
    swabPeriodName: true,
  },
};

@Injectable()
export class SwabLabQueryService {
  constructor(
    private readonly swabAreaHistoryService: SwabAreaHistoryService,
  ) {}

  async queryLabSwabPlan(
    queryLabSwabPlanDto: QueryLabSwabPlanDto,
  ): Promise<SwabAreaHistory[]> {
    const where: FindOptionsWhere<SwabAreaHistory> =
      this.swabAreaHistoryService.toFilter(queryLabSwabPlanDto);

    return await this.swabAreaHistoryService.find({
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
        // swabAreaSwabedAt: {
        //   direction: 'asc',
        // },
      },
    });
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
