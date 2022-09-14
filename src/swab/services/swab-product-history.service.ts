import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
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
    } = dto;

    const where: FindOptionsWhere<SwabProductHistory> = {};
    const whereSwabTest: FindOptionsWhere<SwabTest> = {};
    const whereFacilityItem: FindOptionsWhere<FacilityItem> = {};

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

    if (Object.keys(whereSwabTest).length) {
      where.swabTest = whereSwabTest;
    }

    return where;
  }
}
