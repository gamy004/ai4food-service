import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Like, Not, Raw, Repository } from 'typeorm';
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

    console.log(swabStatus);

    if (hasBacteria || swabStatus === SwabStatus.DETECTED) {
      whereSwabTest.bacteriaRecordedAt = Not(IsNull());
      whereBacteria.id = Not(IsNull());
    }

    if (swabStatus === SwabStatus.NORMAL) {
      // whereSwabTest.bacteriaRecordedAt = Not(IsNull());
      whereBacteria.id = IsNull();
    }

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
}
