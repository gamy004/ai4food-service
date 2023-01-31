import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { QueryExportSwabHistoryDto } from '../dto/query-export-swab-history.dto';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';

@Controller('swab')
@ApiTags('Swab')
export class SwabController {
  constructor(private readonly swabPlanQueryService: SwabPlanQueryService) {}

  @Authenticated()
  @Get('export')
  queryExportSwabPlan(
    @Query() queryExportSwabHistoryDto: QueryExportSwabHistoryDto,
  ) {
    return this.swabPlanQueryService.queryExportSwabPlan(
      queryExportSwabHistoryDto,
    );
  }
}
