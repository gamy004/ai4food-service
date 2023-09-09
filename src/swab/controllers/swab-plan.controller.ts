import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwabPlannerService } from '../services/swab-planner.service';
import { SwabPlan } from '../entities/swab-plan.entity';
import { BodyCommandCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import {
  BodyCommandUpdateSwabPlanDto,
  ParamCommandUpdateSwabPlanDto,
} from '../dto/command-update-swab-plan.dto';

@Controller('swab/plan')
@ApiTags('Swab')
export class SwabPlanController {
  constructor(private readonly swabPlannerService: SwabPlannerService) {}

  @Post()
  createDraft(
    @Body() body: BodyCommandCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    const { payload } = body;

    return this.swabPlannerService.commandCreateDraft(payload);
  }

  @Put(':id')
  update(
    @Param()
    param: ParamCommandUpdateSwabPlanDto,
    @Body() body: BodyCommandUpdateSwabPlanDto,
  ): Promise<SwabPlan> {
    const { payload } = body;

    return this.swabPlannerService.commandUpdate(param.id, payload);
  }
}
