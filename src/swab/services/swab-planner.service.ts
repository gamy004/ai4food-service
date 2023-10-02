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
import { PayloadUpdateSwabPlanItemDto } from '../dto/command-update-swab-plan-item.dto';
import { EntityManager, FindOptionsWhere, MoreThan } from 'typeorm';
import {
  DEFAULT_SERVICE_OPTIONS,
  ServiceOptions,
} from '~/common/interface/service-options.interface';
import { PayloadCommandSyncOrderSwabPlanDto } from '../dto/command-sync-order-swab-plan.dto';
import { PayloadCommandFindSwabPlanDto } from '../dto/command-find-swab-plan.dto';

@Injectable()
export class SwabPlannerService {
  constructor(
    private readonly swabPlanCrudService: SwabPlanCrudService,
    private readonly swabPlanItemCrudService: SwabPlanItemCrudService,
    private readonly runningNumberService: RunningNumberService,
    private readonly dateTransformer: DateTransformer,
  ) {}

  async commandFindSwabPlan(
    dto: PayloadCommandFindSwabPlanDto,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlan[]> {
    const { transaction } = options;

    const where = this.swabPlanCrudService.toFilter(dto);

    return await this.swabPlanCrudService.find({ where, transaction });
  }

  async commandFindOneSwabPlan(
    id: string,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlan> {
    const { transaction } = options;

    return await this.swabPlanCrudService.findOneOrFail({
      where: { id },
      transaction,
    });
  }

  async commandCreateDraftSwabPlan(
    dto: PayloadCreateDraftSwabPlanDto,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlan> {
    const { transaction } = options;

    const swabPlan = this.swabPlanCrudService.make({
      swabPlanDate: this.dateTransformer.toObject(dto.swabPlanDate),
      swabPeriodId: dto.swabPeriod.id,
      swabPlanCode: dto.swabPlanCode?.trim() ?? null,
      swabPlanNote: dto.swabPlanNote ?? null,
      totalItems: 0,
      publish: false,
    });

    return await this.swabPlanCrudService.save(swabPlan, { transaction });
  }

  async commandUpdateSwabPlan(
    id: string,
    dto: PayloadUpdateSwabPlanDto,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlan> {
    const { transaction } = options;

    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({ id });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot update swab plan, revert it to draft to update swab plan.',
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
      swabPlan.swabPlanNote = dto.swabPlanNote.trim();
    }

    if (dto.swabPlanCode && swabPlan.swabPlanCode !== dto.swabPlanCode) {
      swabPlan.swabPlanCode = dto.swabPlanCode.trim();
    }

    return await this.swabPlanCrudService.save(swabPlan, { transaction });
  }

  async commandDeleteSwabPlan(
    id: string,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<void> {
    const { transaction } = options;

    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({ id });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot delete swab plan, revert it to draft to delete swab plan.',
        HttpStatus.CONFLICT,
      );
    }

    await this.swabPlanCrudService.removeOne(swabPlan, { transaction });
  }

  async commandFindSwabPlanItem(
    swabPlanId: string,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlanItem[]> {
    const { transaction } = options;

    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({
      id: swabPlanId,
    });

    return await this.swabPlanItemCrudService.find({
      where: { swabPlanId: swabPlan.id },
      order: { order: 'asc' },
      transaction,
    });
  }

  async commandAddSwabPlanItem(
    swabPlanId: string,
    dto: PayloadAddSwabPlanItemDto,
    queryManager: EntityManager,
  ): Promise<SwabPlanItem> {
    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({
      id: swabPlanId,
    });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot add item, revert swab plan to draft to add item.',
        HttpStatus.CONFLICT,
      );
    }

    const order = await this.runningNumberService.generateV2(
      {
        key: `swab-plan-${swabPlan.swabPlanDate}`,
      },
      queryManager,
    );

    let swabPlanItem = this.swabPlanItemCrudService.make({
      swabPlanId: swabPlan.id,
      swabAreaId: dto.swabArea.id,
      facilityItemId: dto.facilityItem?.id ?? null,
      order,
    });

    swabPlanItem = await this.swabPlanItemCrudService.save(swabPlanItem, {
      transaction: false,
    });

    await this.commandUpdateSwabPlanTotalItem(swabPlan, {
      transaction: false,
    });

    return swabPlanItem;
  }

  async commandUpdateSwabPlanItem(
    id: string,
    dto: PayloadUpdateSwabPlanItemDto,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlanItem> {
    const { transaction } = options;

    const swabPlanItem = await this.swabPlanItemCrudService.findOneByOrFail({
      id,
    });

    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({
      id: swabPlanItem.swabPlanId,
    });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot update item, revert swab plan to draft to update item.',
        HttpStatus.CONFLICT,
      );
    }

    if (dto.swabArea.id && dto.swabArea.id !== swabPlanItem.swabAreaId) {
      swabPlanItem.swabAreaId = dto.swabArea.id;
    }

    if (
      dto.facilityItem &&
      dto.facilityItem.id !== swabPlanItem.facilityItemId
    ) {
      swabPlanItem.facilityItemId = dto.facilityItem.id;
    }

    return await this.swabPlanItemCrudService.save(swabPlanItem, {
      transaction,
    });
  }

  async commandDeleteSwabPlanItem(
    id: string,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<void> {
    const { transaction } = options;

    const swabPlanItem = await this.swabPlanItemCrudService.findOneByOrFail({
      id,
    });

    const swabPlan = await this.swabPlanCrudService.findOneByOrFail({
      id: swabPlanItem.swabPlanId,
    });

    if (swabPlan.publish) {
      throw new PublishedSwabPlanException(
        'cannot delete item, revert swab plan to draft to delete item.',
        HttpStatus.CONFLICT,
      );
    }

    await this.swabPlanItemCrudService.removeOne(swabPlanItem, { transaction });

    await this.commandUpdateSwabPlanTotalItem(swabPlan, options);

    await this.commandSyncOrderSwabPlan(
      swabPlan,
      {
        after: swabPlanItem.order,
      },
      options,
    );
  }

  async commandUpdateSwabPlanTotalItem(
    swabPlan: SwabPlan,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<SwabPlan> {
    const { transaction } = options;

    const totalItems = await this.swabPlanItemCrudService.count({
      where: { swabPlanId: swabPlan.id },
      transaction,
    });

    swabPlan.totalItems = totalItems;

    swabPlan = await this.swabPlanCrudService.save(swabPlan, { transaction });

    const runningNumber = await this.runningNumberService.findOneByOrFail({
      key: `swab-plan-${swabPlan.swabPlanDate}`,
    });

    runningNumber.latestRunningNumber = totalItems;

    await this.runningNumberService.save(runningNumber, { transaction });

    return swabPlan;
  }

  async commandSyncOrderSwabPlan(
    swabPlan: SwabPlan,
    dto: PayloadCommandSyncOrderSwabPlanDto,
    options: ServiceOptions = DEFAULT_SERVICE_OPTIONS,
  ): Promise<void> {
    const { transaction } = options;

    const where: FindOptionsWhere<SwabPlanItem> = { swabPlanId: swabPlan.id };

    if (dto.after) {
      where.order = MoreThan(dto.after);
    }

    const updatedSwabPlanItems = await this.swabPlanItemCrudService.find({
      where,
      order: { order: 'asc' },
      transaction,
    });

    let counter = dto.after ?? 1;

    updatedSwabPlanItems.map((updatedSwabPlanItem) => {
      updatedSwabPlanItem.order = counter++;

      return updatedSwabPlanItem;
    });

    await this.swabPlanItemCrudService.saveMany(updatedSwabPlanItems, {
      transaction,
    });
  }
}
