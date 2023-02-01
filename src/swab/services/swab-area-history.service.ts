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
import { FilterSwabAreaHistoryDto } from '../dto/filter-swab-area-history.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabStatus, SwabTest } from '../entities/swab-test.entity';

@Injectable()
export class SwabAreaHistoryService extends CrudService<SwabAreaHistory> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(SwabAreaHistory)
    repository: Repository<SwabAreaHistory>,
  ) {
    super(repository);
  }

  transformDateRangeFIlter;

  toFilter(dto: FilterSwabAreaHistoryDto): FindOptionsWhere<SwabAreaHistory> {
    let {
      swabAreaId,
      facilityId,
      facilityItemId,
      swabPeriodId,
      shift,
      swabAreaDate: swabAreaDateString,
      swabTestCode,
      swabTestId,
      bacteriaName,
      hasBacteria,
      fromDate,
      toDate: toDateString,
      id,
      swabStatus,
    } = dto;
    const whereFacilityItem: FindOptionsWhere<FacilityItem> = {};
    const whereSwabArea: FindOptionsWhere<SwabArea> = {};
    const whereSwabAreaHistory: FindOptionsWhere<SwabAreaHistory> = {};
    const whereSwabTest: FindOptionsWhere<SwabTest> = {};
    const whereBacteria: FindOptionsWhere<Bacteria> = {};

    if (id) {
      whereSwabAreaHistory.id = id;
    }

    if (shift) {
      whereSwabAreaHistory.shift = shift;
    }

    if (swabTestId) {
      whereSwabAreaHistory.swabTestId = swabTestId;
    }

    if (swabPeriodId) {
      whereSwabAreaHistory.swabPeriodId = swabPeriodId;
    }

    if (swabAreaId) {
      whereSwabAreaHistory.swabAreaId = swabAreaId;
    }

    if (swabTestCode && swabTestCode.length) {
      whereSwabTest.swabTestCode = Like(`%${swabTestCode}%`);
    }

    if (swabStatus === SwabStatus.PENDING) {
      whereSwabTest.swabTestRecordedAt = IsNull();
    }

    if (hasBacteria || swabStatus === SwabStatus.DETECTED) {
      whereSwabTest.bacteriaRecordedAt = Not(IsNull());
      whereBacteria.id = Not(IsNull());
    }

    // The implementation has issue with default where cause use inner join to query which make impossible to where `bacteria`.`id` IS NULL
    // if (swabStatus === SwabStatus.NORMAL) {
    //   whereSwabTest.bacteriaRecordedAt = Not(IsNull());
    //   whereBacteria.id = IsNull();
    // }

    if (bacteriaName && bacteriaName.length) {
      whereBacteria.bacteriaName = Like(`%${bacteriaName}%`);
    }

    if (facilityId) {
      whereSwabArea.facilityId = facilityId;
    }

    if (facilityItemId) {
      whereSwabAreaHistory.facilityItemId = facilityItemId;
    }

    if (Object.keys(whereFacilityItem).length) {
      whereSwabAreaHistory.facilityItem = whereFacilityItem;
    }

    if (Object.keys(whereSwabArea).length) {
      whereSwabAreaHistory.swabArea = whereSwabArea;
    }

    if (Object.keys(whereBacteria).length) {
      whereSwabTest.bacteria = whereBacteria;
    }

    if (Object.keys(whereSwabTest).length) {
      whereSwabAreaHistory.swabTest = whereSwabTest;
    }

    if (swabAreaDateString) {
      whereSwabAreaHistory.swabAreaDate =
        this.dateTransformer.toObject(swabAreaDateString);
    }

    let toDate;

    if (toDateString) {
      toDate = this.dateTransformer.toObject(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate = this.dateTransformer.toString(toDate);
    }

    if (fromDate && toDate) {
      whereSwabAreaHistory.swabAreaDate = Raw(
        (field) => `${field} >= '${fromDate}' and ${field} < '${toDate}'`,
      );
    } else {
      if (fromDate) {
        whereSwabAreaHistory.swabAreaDate = Raw(
          (field) => `${field} >= '${fromDate}'`,
        );
      }

      if (toDate) {
        whereSwabAreaHistory.swabAreaDate = Raw(
          (field) => `${field} < '${toDate}'`,
        );
      }
    }

    return whereSwabAreaHistory;
  }

  toQuery(dto: FilterSwabAreaHistoryDto): SelectQueryBuilder<SwabAreaHistory> {
    let {
      swabAreaId,
      facilityId,
      facilityItemId,
      swabPeriodId,
      shift,
      swabAreaDate,
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
    } = dto;

    const query = this.repository
      .createQueryBuilder('swab_area_history')
      .innerJoinAndSelect('swab_area_history.swabTest', 'swab_test')
      .innerJoin('swab_area_history.swabPeriod', 'swab_period')
      .innerJoin('swab_area_history.swabArea', 'swab_area')
      .innerJoin('swab_area.facility', 'facility')
      .leftJoin('swab_area_history.facilityItem', 'facility_item')
      .leftJoinAndSelect('swab_test.bacteria', 'bacteria')
      .leftJoinAndSelect('swab_test.bacteriaSpecies', 'bacteria_specie')
      .where('swab_area_history.id IS NOT NULL');

    if (shift) {
      query.andWhere('swab_area_history.shift = :shift', { shift });
    }

    if (swabAreaId) {
      query.andWhere('swab_area.id = :swabAreaId', { swabAreaId });
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

    if (swabAreaDate) {
      query.andWhere('swab_area_history.swabAreaDate = :swabAreaDate', {
        swabAreaDate,
      });
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
          'swab_area_history.swabAreaDate',
          fromDate,
          toDate,
        ),
      );
    }

    if (id) {
      query.andWhere('swab_area_history.id = :id', { id });
    }

    if (hasBacteria || swabStatus === SwabStatus.DETECTED) {
      query
        .andWhere(`swab_area_history.swabAreaSwabedAt IS NOT NULL`)
        .andWhere(`swab_test.swabTestRecordedAt IS NOT NULL`)
        .andWhere(`bacteria.id IS NOT NULL`);
    }

    if (swabStatus === SwabStatus.NOT_RECORDED) {
      query.andWhere(`swab_area_history.swabAreaSwabedAt IS NULL`);
    }

    if (swabStatus === SwabStatus.PENDING) {
      query
        .andWhere(`swab_area_history.swabAreaSwabedAt IS NOT NULL`)
        .andWhere(`swab_test.swabTestRecordedAt IS NULL`);
    }

    if (swabStatus === SwabStatus.NORMAL) {
      query
        .andWhere(`swab_area_history.swabAreaSwabedAt IS NOT NULL`)
        .andWhere(`swab_test.swabTestRecordedAt IS NOT NULL`)
        .andWhere(`bacteria.id IS NULL`);
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
