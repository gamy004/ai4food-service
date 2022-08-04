import { Controller, Get, Param, Body, ForbiddenException, Post, Put, Query } from '@nestjs/common';
import { ParamCommandUpdateSwabPlanByIdDto, BodyCommandUpdateSwabPlanByIdDto } from '../dto/command-update-swab-plan-by-id.dto';
import { GenerateSwabPlanDto } from '../dto/generate-swab-plan.dto';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { SwabLabQueryService } from '../services/swab-lab-query.service';
import { SwabPlanManagerService } from '../services/swab-plan-manager.service';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';

@Controller('swab/area-history')
export class SwabAreaHistoryController {
  constructor(
    private readonly swabPlanQueryService: SwabPlanQueryService,
    private readonly swabPlanManagerService: SwabPlanManagerService,
    private readonly swabLabQueryService: SwabLabQueryService,
  ) { }

  @Get()
  queryUpdateSwabPlan(@Query() queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlan(queryUpdateSwabPlanDto);
  }

  @Get("export")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabPlanQueryService.querySwabPlan(querySwabPlanDto);
  }

  @Get(":id")
  queryUpdateSwabPlanById(@Param() queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlanById(queryUpdateSwabPlanByIdDto);
  }

  @Get("lab")
  queryLabSwabPlan(@Query() queryLabSwabPlanDto: QueryLabSwabPlanDto) {
    return this.swabLabQueryService.queryLabSwabPlan(queryLabSwabPlanDto);
  }

  @Post()
  generateSwabPlan(@Query() generateSwabPlanDto: GenerateSwabPlanDto) {
    return this.swabPlanManagerService.generateSwabPlan(generateSwabPlanDto);
  }

  @Put(":id")
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
