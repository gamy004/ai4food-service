import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseFilters,
  Query,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwabPlannerService } from '../services/swab-planner.service';
import { SwabPlan } from '../entities/swab-plan.entity';
import { BodyCommandCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import {
  BodyCommandUpdateSwabPlanDto,
  ParamCommandUpdateSwabPlanDto,
} from '../dto/command-update-swab-plan.dto';
import { ParamCommandDeleteSwabPlanDto } from '../dto/command-delete-swab-plan.dto';
import { PublishedSwabPlanExceptionFilter } from '../filters/published-swab-plan-exception.filter';
import { PayloadCommandGetSwabPlanDto } from '../dto/command-get-swab-plan.dto';

@Controller('swab/plan')
@ApiTags('Swab')
export class SwabPlanController {
  constructor(private readonly swabPlannerService: SwabPlannerService) {}

  @Get()
  async get(
    @Query() payload: PayloadCommandGetSwabPlanDto,
  ): Promise<SwabPlan[]> {
    return this.swabPlannerService.commandGetSwabPlan(payload);
  }

  @Post()
  async create(
    @Body() body: BodyCommandCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    const { payload } = body;

    return await this.swabPlannerService.commandCreateDraftSwabPlan(payload);
  }

  @Put(':id')
  @UseFilters(PublishedSwabPlanExceptionFilter)
  async update(
    @Param()
    param: ParamCommandUpdateSwabPlanDto,
    @Body() body: BodyCommandUpdateSwabPlanDto,
  ): Promise<SwabPlan> {
    const { payload } = body;

    return await this.swabPlannerService.commandUpdateSwabPlan(
      param.id,
      payload,
    );
  }

  @Delete(':id')
  @UseFilters(PublishedSwabPlanExceptionFilter)
  async delete(
    @Param()
    param: ParamCommandDeleteSwabPlanDto,
  ): Promise<void> {
    await this.swabPlannerService.commandDeleteSwabPlan(param.id);
  }
}
