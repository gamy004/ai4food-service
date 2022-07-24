import { Body, Controller, ForbiddenException, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { BodyCommandUpdateSwabPlanByIdDto, ParamCommandUpdateSwabPlanByIdDto } from '../dto/command-update-swab-plan-by-id.dto';
import { SwabPlanManagerService } from '../services/swab-plan-manager.service';

@Controller('swab')
export class SwabController {
  constructor(
    private readonly swabPlanManagerService: SwabPlanManagerService,
    private readonly swabPlanQueryService: SwabPlanQueryService
  ) { }
  @Get("plan")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabPlanQueryService.querySwabPlan(querySwabPlanDto);
  }

  @Get("update-plan")
  queryUpdateSwabPlan(@Query() queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlan(queryUpdateSwabPlanDto);
  }

  @Get("lab-swab")
  queryLabSwabPlan(@Query() queryLabSwabPlanDto: QueryLabSwabPlanDto) {
    return this.swabPlanQueryService.queryLabSwabPlan(queryLabSwabPlanDto);
  }

  @Get("update-plan/:id")
  queryUpdateSwabPlanById(@Param() queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlanById(queryUpdateSwabPlanByIdDto);
  }

  @Post('generate')
  generateSwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabPlanManagerService.generateSwabPlan(querySwabPlanDto);
  }

  @Put("update-plan/:id")
  async commandUpdateSwabPlanById(
    @Param() paramCommandUpdateSwabPlanByIdDto: ParamCommandUpdateSwabPlanByIdDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyCommandUpdateSwabPlanByIdDto
  ) {

    try {
      await this.swabPlanManagerService.commandUpdateSwabPlanById(
        paramCommandUpdateSwabPlanByIdDto.id,
        bodycommandUpdateSwabPlanByIdDto
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update swab plan success'
    };
  }
}
