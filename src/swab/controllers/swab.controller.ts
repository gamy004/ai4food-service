import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { SwabAreaService } from '../services/swab-area.service';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';

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

  @Get("update-plan/:id")
  queryUpdateSwabPlanById(@Param() queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto) {
    return this.swabService.queryUpdateSwabPlanById(queryUpdateSwabPlanByIdDto);
  }
}
