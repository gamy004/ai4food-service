import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';

@Controller('swab')
@ApiTags('Swab')
export class SwabController {
  constructor(private readonly swabPlanQueryService: SwabPlanQueryService) {}

  @Authenticated()
  @Get('export')
  queryExportSwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabPlanQueryService.queryExportSwabPlan(querySwabPlanDto);
  }
}
