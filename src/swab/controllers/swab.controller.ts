import { Controller, Get, Post, Query } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';

@Controller('swab')
export class SwabController {
  constructor(private readonly swabService: SwabService) { }
  @Post('generate-swab-plan')
  generateSwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.generateSwabPlan(querySwabPlanDto);
  }

  @Get("plan")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.querySwabPlan(querySwabPlanDto);
  }
}
