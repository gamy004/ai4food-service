import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
// import { CreateSwabAreaHistoryDto } from '../dto/create-swab-area-history.dto';
// import { UpdateSwabAreaHistoryDto } from '../dto/update-swab-area-history.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';

@Injectable()
export class SwabAreaHistoryService extends CrudService<SwabAreaHistory> {
  constructor(
    @InjectRepository(SwabAreaHistory)
    repository: Repository<SwabAreaHistory>
  ) {
    super(repository);
  }
}
