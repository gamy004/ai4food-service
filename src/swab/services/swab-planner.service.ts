import { HttpStatus, Injectable } from '@nestjs/common';
import { SwabPlanCrudService } from './swab-plan-crud.service';
import { PayloadCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import { SwabPlan } from '../entities/swab-plan.entity';
import { PayloadUpdateSwabPlanDto } from '../dto/command-update-swab-plan.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { PublishedSwabPlanException } from '../exceptions/published-swab-plan.exception';
import { SwabPlanItemCrudService } from './swab-plan-item-crud.service';
import { RunningNumberService } from '~/common/services/running-number.service';
import { SwabPlanItem } from '../entities/swab-plan-item.entity';
import { PayloadAddSwabPlanItemDto } from '../dto/command-add-swab-plan-item.dto';

@Injectable()
export class SwabPlannerService {
  constructor(
    private readonly swabPlanCrudService: SwabPlanCrudService,
    private readonly swabPlanItemCrudService: SwabPlanItemCrudService,
    private readonly runningNumberService: RunningNumberService,
    private readonly dateTransformer: DateTransformer,
  ) {}

  async commandCreateDraftSwabPlan(
    dto: PayloadCreateDraftSwabPlanDto,
  ): Promise<SwabPlan> {
    const swabPlan = this.swabPlanCrudService.make({
      swabPlanDate: this.dateTransformer.toObject(dto.swabPlanDate),
      swabPeriodId: dto.swabPeriod.id,
      swabPlanCode: dto.swabPlanCode?.trim() ?? null,
      swabPlanNote: dto.swabPlanNote ?? null,
      totalItems: 0,
      publish: false,
    });

    return await this.swabPlanCrudService.save(swabPlan);
  }

  async commandUpdateSwabPlan(
    id: string,
    dto: PayloadUpdateSwabPlanDto,
  ): Promise<SwabPlan> {
    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({ id });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot update published swab plan, revert it to draft to update.',
        HttpStatus.CONFLICT,
      );
    }

    if (dto.swabPlanDate) {
      swabPlan.swabPlanDate = this.dateTransformer.toObject(dto.swabPlanDate);
    }

    if (dto.swabPeriod?.id && swabPlan.swabPeriodId !== dto.swabPeriod.id) {
      swabPlan.swabPeriodId = dto.swabPeriod.id;
    }

    if (dto.shift && swabPlan.shift !== dto.shift) {
      swabPlan.shift = dto.shift;
    }

    if (dto.swabPlanNote && swabPlan.swabPlanNote !== dto.swabPlanNote) {
      swabPlan.swabPlanNote = dto.swabPlanNote;
    }

    if (dto.swabPlanCode && swabPlan.swabPlanCode !== dto.swabPlanCode) {
      swabPlan.swabPlanCode = dto.swabPlanCode.trim();
    }

    return await this.swabPlanCrudService.save(swabPlan);
  }

  async commandDeleteSwabPlan(id: string): Promise<void> {
    const entity = await this.swabPlanCrudService.findOneByOrFail({ id });

    if (entity.publish) {
      throw new PublishedSwabPlanException(
        'cannot delete published swab plan, revert it to draft to delete.',
        HttpStatus.CONFLICT,
      );
    }

    await this.swabPlanCrudService.removeOne(entity);
  }

  async commandAddSwabPlanItem(
    dto: PayloadAddSwabPlanItemDto,
  ): Promise<SwabPlanItem> {
    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({
      id: dto.swabPlan.id,
    });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot add item to this swab plan, revert it to draft to add new item.',
        HttpStatus.CONFLICT,
      );
    }

    const order = await this.runningNumberService.generate({
      key: `swab-plan-${swabPlan.swabPlanDate}`,
    });

    const swabPlanItem = this.swabPlanItemCrudService.make({
      swabPlanId: swabPlan.id,
      swabAreaId: dto.swabArea.id,
      facilityItemId: dto.facilityItem?.id ?? null,
      order,
    });

    return await this.swabPlanItemCrudService.save(swabPlanItem);
  }
}
