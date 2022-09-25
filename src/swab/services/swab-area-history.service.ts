import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { Bacteria } from '~/lab/entities/bacteria.entity';
import { FilterSwabAreaHistoryDto } from '../dto/filter-swab-area-history.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabTest } from '../entities/swab-test.entity';

@Injectable()
export class SwabAreaHistoryService extends CrudService<SwabAreaHistory> {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(SwabAreaHistory)
    repository: Repository<SwabAreaHistory>,
  ) {
    super(repository);
  }

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
      id,
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

    if (bacteriaName) {
      whereBacteria.bacteriaName = Like(`%${bacteriaName}%`);
      whereSwabTest.bacteria = whereBacteria;
    }

    if (facilityId) {
      whereFacilityItem.facilityId = facilityId;
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

    if (Object.keys(whereSwabTest).length) {
      whereSwabAreaHistory.swabTest = whereSwabTest;
    }

    if (swabAreaDateString) {
      whereSwabAreaHistory.swabAreaDate =
        this.dateTransformer.toObject(swabAreaDateString);
    }

    return whereSwabAreaHistory;
  }
}
