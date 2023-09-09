import { Injectable } from '@nestjs/common';
import { SwabPlanCrudService } from './swab-plan-crud.service';
import { PayloadCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import { SwabPlan } from '../entities/swab-plan.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class SwabPlannerService {
  constructor(private readonly swabPlanCrudService: SwabPlanCrudService) {}

  async commandCreateDraftSwabPlan(
    dto: PayloadCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    const params: DeepPartial<SwabPlan> = {
      ...dto,
      totalItems: 0,
      publish: false,
    };

    return await this.swabPlanCrudService.create(params);
  }
}
