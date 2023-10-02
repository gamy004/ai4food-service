import {
  Controller,
  Post,
  Param,
  Body,
  Put,
  UseFilters,
  Delete,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BodyCommandAddSwabPlanItemDto,
  ParamCommandAddSwabPlanItemDto,
} from '../dto/command-add-swab-plan-item.dto';
import { SwabPlanItem } from '../entities/swab-plan-item.entity';
import { SwabPlannerService } from '../services/swab-planner.service';
import { PublishedSwabPlanExceptionFilter } from '../filters/published-swab-plan-exception.filter';
import {
  BodyCommandUpdateSwabPlanItemDto,
  ParamCommandUpdateSwabPlanItemDto,
} from '../dto/command-update-swab-plan-item.dto';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { ParamCommandDeleteSwabPlanItemDto } from '../dto/command-delete-swab-plan-item.dto';
import { ParamCommandFindSwabPlanItemDto } from '../dto/command-find-swab-plan-item.dto';

@Controller('swab/plan/:swabPlanId/item')
@ApiTags('Swab')
export class SwabPlanItemController {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly swabPlannerService: SwabPlannerService,
  ) {}

  @Get()
  async find(
    @Param() param: ParamCommandFindSwabPlanItemDto,
  ): Promise<SwabPlanItem[]> {
    return this.swabPlannerService.commandFindSwabPlanItem(param.swabPlanId);
  }

  @Post()
  async create(
    @Param() param: ParamCommandAddSwabPlanItemDto,
    @Body() body: BodyCommandAddSwabPlanItemDto,
  ): Promise<SwabPlanItem> {
    const { payload } = body;

    let swabPlanItem;

    await this.transaction.execute(async (queryManager) => {
      swabPlanItem = await this.swabPlannerService.commandAddSwabPlanItem(
        param.swabPlanId,
        payload,
        queryManager,
      );
    });

    return swabPlanItem;
  }

  @Put(':swabPlanItemId')
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
        param.swabPlanItemId,
        payload,
        { transaction: false },
      );
    });

    return swabPlanItem;
  }

  @Delete(':swabPlanItemId')
  @UseFilters(PublishedSwabPlanExceptionFilter)
  async delete(
    @Param()
    param: ParamCommandDeleteSwabPlanItemDto,
  ): Promise<void> {
    await this.transaction.execute(async () => {
      await this.swabPlannerService.commandDeleteSwabPlanItem(
        param.swabPlanItemId,
        {
          transaction: false,
        },
      );
    });
  }
}
