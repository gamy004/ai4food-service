import { Controller, Post, Param, Body, Put, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BodyCommandAddSwabPlanItemDto } from '../dto/command-add-swab-plan-item.dto';
import { SwabPlanItem } from '../entities/swab-plan-item.entity';
import { SwabPlannerService } from '../services/swab-planner.service';
import { PublishedSwabPlanExceptionFilter } from '../filters/published-swab-plan-exception.filter';
import {
  BodyCommandUpdateSwabPlanItemDto,
  ParamCommandUpdateSwabPlanItemDto,
} from '../dto/command-update-swab-plan-item.dto';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';

@Controller('swab/plan/item')
@ApiTags('Swab')
export class SwabPlanItemController {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly swabPlannerService: SwabPlannerService,
  ) {}

  @Post()
  async create(
    @Body() body: BodyCommandAddSwabPlanItemDto,
  ): Promise<SwabPlanItem> {
    const { payload } = body;

    let swabPlanItem;

    await this.transaction.execute(async (queryManager) => {
      swabPlanItem = await this.swabPlannerService.commandAddSwabPlanItem(
        payload,
        queryManager,
      );
    });

    return swabPlanItem;
  }

  @Put(':id')
  @UseFilters(PublishedSwabPlanExceptionFilter)
  async update(
    @Param()
    param: ParamCommandUpdateSwabPlanItemDto,
    @Body() body: BodyCommandUpdateSwabPlanItemDto,
  ): Promise<SwabPlanItem> {
    const { payload } = body;

    let swabPlanItem;

    await this.transaction.execute(async () => {
      swabPlanItem = await this.swabPlannerService.commandUpdateSwabPlanItem(
        param.id,
        payload,
        { transaction: false },
      );
    });

    return swabPlanItem;
  }
}
