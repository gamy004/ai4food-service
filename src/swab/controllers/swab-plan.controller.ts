import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwabPlannerService } from '../services/swab-planner.service';
import { SwabPlan } from '../entities/swab-plan.entity';
import { BodyCommandCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';

@Controller('swab/plan')
@ApiTags('Swab')
export class SwabPlanController {
  constructor(private readonly swabPlannerService: SwabPlannerService) {}

  @Post()
  createDraft(
    @Body() body: BodyCommandCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    return this.swabPlannerService.commandCreateDraftSwabPlan(body);
  }
}
