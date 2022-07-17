import { Controller, Get, Query } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { SwabAreaService } from '../services/swab-area.service';

@Controller('swab')
export class SwabController {
  constructor(
    private readonly swabAreaService: SwabAreaService,
    private readonly swabService: SwabService
  ) { }

  @Get('generate-swab-plan')
  generateSwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.generateSwabPlan(querySwabPlanDto);
  }

  @Get("plan")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.querySwabPlan(querySwabPlanDto);
  }
}
