import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { ResponseSwabPlanDto } from '../dto/response-swab-plan.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabPeriodService } from './swab-period.service';

@Injectable()
export class SwabService {
  constructor(
    protected readonly swabPeriodService: SwabPeriodService,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>,
    @InjectRepository(SwabArea)
    protected readonly swabAreaRepository: Repository<SwabArea>
  ) { }

  async querySwabPlan(querySwabPlanDto: QuerySwabPlanDto): Promise<ResponseSwabPlanDto> {
    const { fromDate: fromDateString, toDate: toDateString } = querySwabPlanDto;

    const where: FindOptionsWhere<SwabAreaHistory> = {};

    let fromDate, toDate;

    if (fromDateString) {
      fromDate = new Date(fromDateString);

      fromDate.setMinutes(0, 0, 0);
    }

    if (toDateString) {
      toDate = new Date(toDateString);

      toDate.setDate(toDate.getDate() + 1);

      toDate.setMinutes(0, 0, 0);
    }

    if (fromDate && toDate) {
      where.swabAreaDate = Between(fromDate, toDate);
    } else {
      if (fromDate) {
        where.swabAreaDate = MoreThanOrEqual(fromDate);
      } else {
        where.swabAreaDate = LessThan(fromDate);
      }
    }

    const swabPeriods = await this.swabPeriodService.findAll();

    const swabAreaHistories = await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        //   swabPeriod: true,
        //   swabArea: true,
        swabTest: true
      },
      select: {
        swabAreaDate: true,
        swabPeriodId: true,
        swabAreaId: true,
        swabTest: {
          swabTestCode: true
        }
      }
    });

    let swabAreas = [];

    if (swabAreaHistories.length) {
      const swabAreaIds = swabAreaHistories.map(({ swabAreaId }) => swabAreaId);

      if (swabAreaIds.length) {
        swabAreas = await this.swabAreaRepository.findBy({
          id: In(swabAreaIds)
        });
      }
    }
    return {
      swabPeriods,
      swabAreaHistories,
      swabAreas
    };
  }
}
