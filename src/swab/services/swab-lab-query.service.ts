import { format } from 'date-fns-tz';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabTest } from '../entities/swab-test.entity';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';

@Injectable()
export class SwabLabQueryService {
  constructor(
    @InjectRepository(SwabAreaHistory)
    protected readonly swabAreaHistoryRepository: Repository<SwabAreaHistory>
  ) { }

  private async transformLabSwabPlanDto(queryLabSwabPlanDto: QueryLabSwabPlanDto): Promise<FindOptionsWhere<SwabAreaHistory>> {
    let { swabAreaDate: swabAreaDateString, swabTestCode } = queryLabSwabPlanDto;

    const whereSwabTest: FindOptionsWhere<SwabTest> = {
      swabTestCode
    };

    const whereSwabAreaHistory: FindOptionsWhere<SwabAreaHistory> = {};

    if (swabAreaDateString) {
      let swabAreaDate = new Date(swabAreaDateString);

      swabAreaDate.setMinutes(0, 0, 0);

      whereSwabAreaHistory.swabAreaDate = swabAreaDate;
    }

    whereSwabAreaHistory.swabTest = whereSwabTest;

    return whereSwabAreaHistory;
  }

  async queryLabSwabPlan(queryLabSwabPlanDto: QueryLabSwabPlanDto): Promise<SwabAreaHistory[]> {
    const where: FindOptionsWhere<SwabAreaHistory> = await this.transformLabSwabPlanDto(
      queryLabSwabPlanDto
    );

    return await this.swabAreaHistoryRepository.find({
      where,
      relations: {
        swabTest: true,
        swabArea: {
          facility: true,
          subSwabAreas: true
        },
        swabPeriod: true
      },
      select: {
        id: true,
        swabAreaDate: true,
        swabTestId: true,
        swabTest: {
          id: true,
          swabTestCode: true
        }
      },
      order: {
        swabTest: {
          id: {
            direction: 'asc'
          }
        }
      }
    });
  }

}
