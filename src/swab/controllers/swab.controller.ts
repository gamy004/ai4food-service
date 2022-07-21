import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { SwabAreaService } from '../services/swab-area.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { BodyCommandUpdateSwabPlanByIdDto, ParamCommandUpdateSwabPlanByIdDto } from '../dto/command-update-swab-plan-by-id.dto';

@Controller('swab')
export class SwabController {
  constructor(
    private readonly swabAreaService: SwabAreaService,
    private readonly swabService: SwabService
  ) { }

  @Post('generate')
  generateSwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.generateSwabPlan(querySwabPlanDto);
  }

  @Get("plan")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.querySwabPlan(querySwabPlanDto);
  }

  @Get("update-plan")
  queryUpdateSwabPlan(@Query() queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto) {
    return this.swabService.queryUpdateSwabPlan(queryUpdateSwabPlanDto);
  }

  @Get("lab-swab")
  queryLabSwabPlan(@Query() queryLabSwabPlanDto: QueryLabSwabPlanDto) {
    return this.swabService.queryLabSwabPlan(queryLabSwabPlanDto);
  }
  @Get("update-plan/:id")
  queryUpdateSwabPlanById(@Param() queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto) {
    return this.swabService.queryUpdateSwabPlanById(queryUpdateSwabPlanByIdDto);
  }

  @Put("update-plan/:id")
  commandUpdateSwabPlanById(
    @Param() paramCommandUpdateSwabPlanByIdDto: ParamCommandUpdateSwabPlanByIdDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyCommandUpdateSwabPlanByIdDto
  ) {
    return this.swabService.commandUpdateSwabPlanById(
      paramCommandUpdateSwabPlanByIdDto.id,
      bodycommandUpdateSwabPlanByIdDto
    );
  }
}
