import { Controller, Get, Query } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { CreateSwabDto } from '../dto/create-swab.dto';
import { UpdateSwabDto } from '../dto/update-swab.dto';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';

@Controller('swab')
export class SwabController {
  constructor(private readonly swabService: SwabService) { }

  @Get("plan")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabService.querySwabPlan(querySwabPlanDto);
  }
}
