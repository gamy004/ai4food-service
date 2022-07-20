import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { utcToZonedTime } from 'date-fns-tz';
import { Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
// import { CreateSwabAreaHistoryDto } from '../dto/create-swab-area-history.dto';
import { UpdateSwabAreaHistoryDto } from '../dto/update-swab-area-history.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabEnvironment } from '../entities/swab-environment.entity';

const TIME_ZONE = 'Asia/Bangkok'

@Injectable()
export class SwabAreaHistoryService extends CrudService<SwabAreaHistory> {
  constructor(
    @InjectRepository(SwabAreaHistory)
    repository: Repository<SwabAreaHistory>
  ) {
    super(repository);
  }

  async updateId(id: string, updateSwabAreaHistoryDto: UpdateSwabAreaHistoryDto) {
    const { swabEnvironment } = updateSwabAreaHistoryDto
    const swabAreaHistory = updateSwabAreaHistoryDto

    if (swabEnvironment && !swabEnvironment.id) {
      const { swabEnvironmentName } = swabEnvironment
      const swabEnvironmentData = SwabEnvironment.create({
        swabEnvironmentName
      });

      swabAreaHistory.swabEnvironment = swabEnvironmentData;
    }

    swabAreaHistory.swabAreaSwabedAt = utcToZonedTime(new Date(), TIME_ZONE);

    return await this.repository.save({ id, ...swabAreaHistory });
  }
}
