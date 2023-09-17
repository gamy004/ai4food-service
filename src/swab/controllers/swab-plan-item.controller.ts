import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BodyCommandAddSwabPlanItemDto } from '../dto/command-add-swab-plan-item.dto';
import { SwabPlanItem } from '../entities/swab-plan-item.entity';
import { SwabPlannerService } from '../services/swab-planner.service';

@Controller('swab/plan/item')
@ApiTags('Swab')
export class SwabPlanItemController {
  constructor(private readonly swabPlannerService: SwabPlannerService) {}

  @Post()
  async create(
    @Body() body: BodyCommandAddSwabPlanItemDto,
  ): Promise<SwabPlanItem> {
    const { payload } = body;

    return await this.swabPlannerService.commandAddSwabPlanItem(payload);
  }
}
