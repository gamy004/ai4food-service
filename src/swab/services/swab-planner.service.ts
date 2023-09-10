import { HttpStatus, Injectable } from '@nestjs/common';
import { SwabPlanCrudService } from './swab-plan-crud.service';
import { PayloadCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import { SwabPlan } from '../entities/swab-plan.entity';
import { DeepPartial } from 'typeorm';
import { PayloadUpdateSwabPlanDto } from '../dto/command-update-swab-plan.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { PublishedSwabPlanException } from '../exceptions/published-swab-plan.exception';

@Injectable()
export class SwabPlannerService {
  constructor(
    private readonly swabPlanCrudService: SwabPlanCrudService,
    private readonly dateTransformer: DateTransformer,
  ) {}

  async commandCreateDraft(
    dto: PayloadCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    const entity = this.swabPlanCrudService.make({
      swabPlanDate: this.dateTransformer.toObject(dto.swabPlanDate),
      swabPeriodId: dto.swabPeriod.id,
      swabPlanCode: dto.swabPlanCode?.trim() ?? null,
      swabPlanNote: dto.swabPlanNote ?? null,
      totalItems: 0,
      publish: false,
    });

    return await this.swabPlanCrudService.save(entity);
  }

  async commandUpdate(
    id: string,
    dto: PayloadUpdateSwabPlanDto,
  ): Promise<SwabPlan> {
    const entity = await this.swabPlanCrudService.findOneByOrFail({ id });

    if (dto.swabPlanDate) {
      entity.swabPlanDate = this.dateTransformer.toObject(dto.swabPlanDate);
    }

    if (dto.swabPeriod?.id && entity.swabPeriodId !== dto.swabPeriod.id) {
      entity.swabPeriodId = dto.swabPeriod.id;
    }

    if (dto.shift && entity.shift !== dto.shift) {
      entity.shift = dto.shift;
    }

    if (dto.swabPlanNote && entity.swabPlanNote !== dto.swabPlanNote) {
      entity.swabPlanNote = dto.swabPlanNote;
    }

    if (dto.swabPlanCode && entity.swabPlanCode !== dto.swabPlanCode) {
      entity.swabPlanCode = dto.swabPlanCode.trim();
    }

    return await this.swabPlanCrudService.save(entity);
  }

  async commandDelete(id: string): Promise<void> {
    const entity = await this.swabPlanCrudService.findOneByOrFail({ id });

    if (entity.publish) {
      throw new PublishedSwabPlanException(
        'cannot delete published swab plan, revert it to draft to delete.',
        HttpStatus.CONFLICT,
      );
    }

    await this.swabPlanCrudService.removeOne(entity);
  }
}
