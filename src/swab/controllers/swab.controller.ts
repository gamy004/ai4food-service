import { Controller, Get, Query } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';

@Controller('swab')
export class SwabController {
  constructor(private readonly swabService: SwabService) { }
  @Get('generate-swab-plan')
  generateSwabPlan() {
    return this.swabService.generateSwabPlan();
  }

  @Get("plan")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.querySwabPlan(querySwabPlanDto);
  }
}
