import { Injectable } from '@nestjs/common';
import { SwabPlanCrudService } from './swab-plan-crud.service';
import { BodyCommandCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import { SwabPlan } from '../entities/swab-plan.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class SwabPlannerService {
  constructor(private readonly swabPlanCrudService: SwabPlanCrudService) {}

  async commandCreateDraftSwabPlan(
    dto: BodyCommandCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    const params: DeepPartial<SwabPlan> = {
      ...dto,
      totalItems: 0,
      publish: false,
    };

    return await this.swabPlanCrudService.create(params);
  }
}
