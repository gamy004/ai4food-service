import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { DateTransformer } from '~/common/transformers/date-transformer';

@Injectable()
export class SwabLabQueryService {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>
  ) { }

  private async transformLabSwabPlanDto(queryLabSwabPlanDto: QueryLabSwabPlanDto): Promise<FindOptionsWhere<SwabAreaHistory>> {
    let { swabAreaDate: swabAreaDateString, swabTestCode } = queryLabSwabPlanDto;

    const whereSwabAreaHistory: FindOptionsWhere<SwabAreaHistory> = {};

    if (swabTestCode) {
      whereSwabAreaHistory.swabTest = { swabTestCode };
    }

    if (swabAreaDateString) {
      whereSwabAreaHistory.swabAreaDate = this.dateTransformer.toObject(swabAreaDateString);
    }

    return whereSwabAreaHistory;
  }

  async queryLabSwabPlan(queryLabSwabPlanDto: QueryLabSwabPlanDto): Promise<SwabAreaHistory[]> {
    const where: FindOptionsWhere<SwabAreaHistory> = await this.transformLabSwabPlanDto(
      queryLabSwabPlanDto
    );

    return await this.swabAreaHistoryRepository.find({
      where: {
        ...where,
        swabAreaSwabedAt: Not(IsNull()),
        swabTestId: Not(IsNull())
      },
      relations: {
        swabTest: {
          bacteria: true
        },
        swabArea: {
          facility: true,
          subSwabAreas: true
        },
        swabPeriod: true
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabAreaSwabedAt: true,
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true,
          swabTestRecordedAt: true,
          bacteria: {
            id: true,
            bacteriaName: true
          }
        }
      },
      order: {
        swabTest: {
          swabTestRecordedAt: {
            direction: 'asc'
          }
        },
        swabAreaSwabedAt: {
          direction: 'asc',
        },
      }
    });
  }

  queryLabSwabPlanById(

  ) {
    // get data for update lab
  }
}
