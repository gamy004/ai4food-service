import { Injectable } from '@nestjs/common';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { FindOptionsWhere, In, IsNull, Not, Repository } from 'typeorm';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { SwabAreaHistoryService } from './swab-area-history.service';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { ResponseQueryLabSwabPlanDto } from '../dto/response-query-lab-swab-plan.dto';
import { SwabAreaService } from './swab-area.service';
import { FacilityItemService } from '~/facility/services/facility-item.service';
import { FacilityService } from '~/facility/services/facility.service';
import { SwabPeriodService } from './swab-period.service';
import { QueryLabSwabProductDto } from '../dto/query-lab-swab-product-dto';
import { ResponseQueryLabSwabProductDto } from '../dto/response-query-lab-swab-product-dto';
import { SwabProductHistory } from '../entities/swab-product-history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabTestService } from './swab-test.service';
import { SwabProductHistoryService } from './swab-product-history.service';
import { ProductService } from '~/product/services/product.service';

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
    private readonly dateTransformer: DateTransformer,
    private readonly swabTestService: SwabTestService,
    private readonly productService: ProductService,
    private readonly swabProductHistoryService: SwabProductHistoryService,
    @InjectRepository(SwabProductHistory)
    protected readonly swabProductHistoryRepository: Repository<SwabProductHistory>,
    @InjectRepository(FacilityItem)
    protected readonly facilityItemRepository: Repository<FacilityItem>,
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

  async queryLabSwabProduct(
    queryLabSwabProductDto: QueryLabSwabProductDto,
  ): Promise<ResponseQueryLabSwabProductDto> {
    const where: FindOptionsWhere<SwabProductHistory> =
      this.swabProductHistoryService.toFilter(queryLabSwabProductDto);

    const swabProductHistories = await this.swabProductHistoryService.find({
      where: {
        ...where,
        swabProductSwabedAt: Not(IsNull()),
        swabTestId: Not(IsNull()),
      },
      select: {
        id: true,
        swabProductDate: true,
        swabProductSwabedAt: true,
        shift: true,
        productId: true,
        productLot: true,
        productDate: true,
        swabTestId: true,
        swabPeriodId: true,
        facilityItemId: true,
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
    let facilityItems = [];
    let products = [];
    let swabTests = [];
    let swabPeriods = [];

    if (swabProductHistories.length) {
      const facilityItemIds = [
        ...new Set(
          swabProductHistories.map(({ facilityItemId }) => facilityItemId),
        ),
      ].filter(Boolean);
      const productIds = [
        ...new Set(swabProductHistories.map(({ productId }) => productId)),
      ].filter(Boolean);
      const swabTestIds = [
        ...new Set(swabProductHistories.map(({ swabTestId }) => swabTestId)),
      ].filter(Boolean);
      const swabPeriodIds = [
        ...new Set(
          swabProductHistories.map(({ swabPeriodId }) => swabPeriodId),
        ),
      ].filter(Boolean);

      if (facilityItemIds.length) {
        facilityItems = await this.facilityItemRepository.find({
          where: {
            id: In(facilityItemIds),
          },
          select: {
            id: true,
            facilityItemName: true,
            facilityId: true,
          },
        });
      }

      if (facilityItems.length) {
        const facilityIds = [
          ...new Set(facilityItems.map(({ facilityId }) => facilityId)),
        ].filter(Boolean);

        if (facilityIds.length) {
          facilities = await this.facilityService.find({
            where: {
              id: In(facilityIds),
            },
            select: {
              id: true,
              facilityName: true,
            },
          });
        }
      }

      if (productIds.length) {
        products = await this.productService.find({
          where: {
            id: In(productIds),
          },
          select: {
            id: true,
            productName: true,
          },
        });
      }

      if (swabTestIds.length) {
        swabTests = await this.swabTestService.find({
          where: {
            id: In(swabTestIds),
          },
          relations: {
            bacteria: true,
            bacteriaSpecies: true,
          },
          select: {
            id: true,
            swabTestCode: true,
            swabTestRecordedAt: true,
            swabTestNote: true,
          },
        });
      }

      if (swabPeriodIds.length) {
        swabPeriods = await this.swabPeriodService.find({
          where: {
            id: In(swabPeriodIds),
          },
          select: {
            id: true,
            swabPeriodName: true,
          },
        });
      }
    }

    return {
      swabProductHistories,
      products,
      facilityItems,
      facilities,
      swabTests,
      swabPeriods,
    };
  }
}
