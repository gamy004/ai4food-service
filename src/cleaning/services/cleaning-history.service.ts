import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { FilterCleaningHistoryDto } from '../dto/filter-cleaning-history.dto';
import { CleaningHistory } from '../entities/cleaning-history.entity';

@Injectable()
export class CleaningHistoryService extends CrudService<CleaningHistory> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(CleaningHistory)
    repository: CommonRepositoryInterface<CleaningHistory>,
  ) {
    super(repository);
  }

  toQuery(dto: FilterCleaningHistoryDto): SelectQueryBuilder<CleaningHistory> {
    const {
      id,
      date,
      fromDate,
      toDate,
      shift,
      swabTestCode,
      swabPeriodId,
      facilityId,
      facilityItemId,
      swabAreaId,
      skip,
      take,
    } = dto;

    const query = this.repository
      .createQueryBuilder('cleaning_history')
      .innerJoinAndSelect(
        'cleaning_history.swabAreaHistory',
        'swab_area_history',
      )
      .innerJoinAndSelect('swab_area_history.swabPeriod', 'swab_period')
      .innerJoinAndSelect('swab_area_history.swabArea', 'swab_area')
      .innerJoinAndSelect('swab_area_history.swabTest', 'swab_test')
      .leftJoinAndSelect(
        'cleaning_history.cleaningHistoryValidations',
        'cleaning_history_validation',
      )
      .leftJoinAndSelect('swab_area_history.facilityItem', 'facility_item')
      .leftJoinAndSelect('swab_area.facility', 'facility')
      .where('cleaning_history.id IS NOT NULL');

    if (id) {
      query.andWhere('cleaning_history.id = :id', { id });
    }

    if (shift) {
      query.andWhere('swab_area_history.shift = :shift', { shift });
    }

    if (swabAreaId) {
      query.andWhere('swab_area.id = :swabAreaId', { swabAreaId });
    }

    if (swabPeriodId) {
      query.andWhere('swab_period.id = :swabPeriodId', { swabPeriodId });
    }

    if (swabTestCode) {
      query.andWhere(`swab_test.swabTestCode LIKE('%${swabTestCode}%')`);
    }

    if (facilityId) {
      query.andWhere('facility.id = :facilityId', { facilityId });
    }

    if (facilityItemId) {
      query.andWhere('facility_item.id = :facilityItemId', { facilityItemId });
    }

    if (date) {
      query.andWhere('swab_area_history.swabAreaDate = :date', {
        date,
      });
    }

    if (fromDate || toDate) {
      query.andWhere(
        this.dateTransformer.dateRangeToSql(
          'swab_area_history.swabAreaDate',
          fromDate,
          toDate,
        ),
      );
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
