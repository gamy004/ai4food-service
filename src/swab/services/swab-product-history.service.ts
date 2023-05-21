import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  IsNull,
  Like,
  Not,
  Raw,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Bacteria } from '~/lab/entities/bacteria.entity';
import { FilterSwabProductHistoryDto } from '../dto/filter-swab-product-history.dto';
import { SwabProductHistory } from '../entities/swab-product-history.entity';
import { SwabStatus, SwabTest } from '../entities/swab-test.entity';

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
      fromDate,
      toDate: toDateString,
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

    let toDate;

    if (toDateString) {
      toDate = this.dateTransformer.toObject(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate = this.dateTransformer.toString(toDate);
    }

    if (fromDate && toDate) {
      where.swabProductDate = Raw(
        (field) => `${field} >= '${fromDate}' and ${field} < '${toDate}'`,
      );
    } else {
      if (fromDate) {
        where.swabProductDate = Raw((field) => `${field} >= '${fromDate}'`);
      }

      if (toDate) {
        where.swabProductDate = Raw((field) => `${field} < '${toDate}'`);
      }
    }

    return where;
  }

  toQuery(
    dto: FilterSwabProductHistoryDto,
  ): SelectQueryBuilder<SwabProductHistory> {
    let {
      productId,
      facilityId,
      facilityItemId,
      swabPeriodId,
      shift,
      swabProductDate,
      swabTestCode,
      swabTestId,
      bacteriaName,
      hasBacteria,
      fromDate,
      toDate,
      id,
      swabStatus,
      skip,
      take,
      isReported,
    } = dto;

    const query = this.repository
      .createQueryBuilder('swab_product_history')
      .innerJoinAndSelect('swab_product_history.swabTest', 'swab_test')
      .innerJoin('swab_product_history.swabPeriod', 'swab_period')
      .leftJoin('swab_product_history.product', 'product')
      .leftJoin('swab_product_history.facilityItem', 'facility_item')
      .leftJoin('facility_item.facility', 'facility')
      .leftJoinAndSelect('swab_test.bacteria', 'bacteria')
      .leftJoinAndSelect('swab_test.bacteriaSpecies', 'bacteria_specie')
      .where('swab_product_history.id IS NOT NULL');

    if (shift) {
      query.andWhere('swab_product_history.shift = :shift', { shift });
    }

    if (productId) {
      query.andWhere('product.id = :productId', { productId });
    }

    if (facilityId) {
      query.andWhere('facility.id = :facilityId', { facilityId });
    }

    if (facilityItemId) {
      query.andWhere('facility_item.id = :facilityItemId', { facilityItemId });
    }

    if (swabPeriodId) {
      query.andWhere('swab_period.id = :swabPeriodId', { swabPeriodId });
    }

    if (swabProductDate) {
      query.andWhere(
        'swab_product_history.swabProductDate = :swabProductDate',
        {
          swabProductDate,
        },
      );
    }

    if (swabTestCode) {
      query.andWhere(`swab_test.swabTestCode LIKE('%${swabTestCode}%')`);
    }

    if (swabTestId) {
      query.andWhere('swab_test.id = :swabTestId', { swabTestId });
    }

    if (bacteriaName) {
      query.andWhere('bacteria.bacteriaName = :bacteriaName', { bacteriaName });
    }

    if (fromDate || toDate) {
      query.andWhere(
        this.dateTransformer.dateRangeToSql(
          'swab_product_history.swabProductDate',
          fromDate,
          toDate,
        ),
      );
    }

    if (id) {
      query.andWhere('swab_product_history.id = :id', { id });
    }

    if (hasBacteria || swabStatus === SwabStatus.DETECTED) {
      query
        .andWhere(`swab_product_history.swabProductSwabedAt IS NOT NULL`)
        .andWhere(`swab_test.swabTestRecordedAt IS NOT NULL`)
        .andWhere(`bacteria.id IS NOT NULL`);
    }

    if (swabStatus === SwabStatus.NOT_RECORDED) {
      query.andWhere(`swab_product_history.swabProductSwabedAt IS NULL`);
    }

    if (swabStatus === SwabStatus.PENDING) {
      query
        .andWhere(`swab_product_history.swabProductSwabedAt IS NOT NULL`)
        .andWhere(`swab_test.swabTestRecordedAt IS NULL`);
    }

    if (swabStatus === SwabStatus.NORMAL) {
      query
        .andWhere(`swab_product_history.swabProductSwabedAt IS NOT NULL`)
        .andWhere(`swab_test.swabTestRecordedAt IS NOT NULL`)
        .andWhere(`bacteria.id IS NULL`);
    }

    if (isReported) {
      query.andWhere(`swab_test.isReported = 1`);
    }

    if (skip !== undefined) {
      query.skip(skip);
    }

    if (take !== undefined) {
      query.take(take);
    }

    return query;
  }
}
