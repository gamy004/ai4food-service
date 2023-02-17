import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '~/auth/entities/user.entity';
import { FilterCleaningHistoryDto } from '../dto/filter-cleaning-history.dto';
import { ResponseQueryCleaningHistoryDto } from '../dto/response-query-cleaning-history.dto';
import {
  BodyUpdateCleaningHistoryDto,
  ParamUpdateCleaningHistoryDto,
} from '../dto/update-cleaning-history.dto';
import { CleaningHistoryCleaningValidation } from '../entities/cleaning-history-cleaning-validation.entity';
import { CleaningHistory } from '../entities/cleaning-history.entity';
import { CleaningHistoryService } from './cleaning-history.service';
import { CleaningProgramService } from './cleaning-program.service';

@Injectable()
export class CleaningHistoryQueryService {
  constructor(
    private readonly cleaningHistoryService: CleaningHistoryService,
  ) {}

  async query(
    dto: FilterCleaningHistoryDto,
  ): Promise<ResponseQueryCleaningHistoryDto> {
    const query = this.cleaningHistoryService.toQuery(dto);

    const [cleaningHistories, total] = await query
      .orderBy('swab_test.id', 'ASC')
      .getManyAndCount();

    return {
      cleaningHistories,
      total,
    };
  }
}
