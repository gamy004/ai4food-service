import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Like, Not, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Bacteria } from '~/lab/entities/bacteria.entity';
import { FilterSwabProductHistoryDto } from '../dto/filter-swab-product-history.dto';
import { SwabProductHistory } from '../entities/swab-product-history.entity';
import { SwabTest } from '../entities/swab-test.entity';

@Injectable()
export class SwabProductHistoryService extends CrudService<SwabProductHistory> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(SwabProductHistory)
    repository: Repository<SwabProductHistory>,
  ) {
    super(repository);
  }

  toFilter(
    dto: FilterSwabProductHistoryDto,
  ): FindOptionsWhere<SwabProductHistory> {
    const {
      id,
      shift,
      swabProductDate,
      swabTestCode,
      facilityItemId,
      facilityId,
      swabTestId,
      swabPeriodId,
      productId,
      bacteriaName,
      hasBacteria,
    } = dto;

    const where: FindOptionsWhere<SwabProductHistory> = {};
    const whereSwabTest: FindOptionsWhere<SwabTest> = {};
    const whereFacilityItem: FindOptionsWhere<FacilityItem> = {};
    const whereBacteria: FindOptionsWhere<Bacteria> = {};

    if (id) {
      where.id = id;
    }

    if (shift) {
      where.shift = shift;
    }

    if (swabProductDate) {
      where.swabProductDate = this.dateTransformer.toObject(swabProductDate);
    }

    if (swabTestCode && swabTestCode.length) {
      whereSwabTest.swabTestCode = Like(`%${swabTestCode}%`);
    }

    if (hasBacteria) {
      whereBacteria.id = Not(IsNull());
    }

    if (bacteriaName && bacteriaName.length) {
      whereBacteria.bacteriaName = Like(`%${bacteriaName}%`);
    }

    if (swabTestId) {
      where.swabTestId = swabTestId;
    }

    if (swabPeriodId) {
      where.swabPeriodId = swabPeriodId;
    }

    if (facilityId) {
      whereFacilityItem.facilityId = facilityId;
    }

    if (facilityItemId) {
      where.facilityItemId = facilityItemId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (Object.keys(whereFacilityItem).length) {
      where.facilityItem = whereFacilityItem;
    }

    if (Object.keys(whereBacteria).length) {
      whereSwabTest.bacteria = whereBacteria;
    }

    if (Object.keys(whereSwabTest).length) {
      where.swabTest = whereSwabTest;
    }

    return where;
  }
}
