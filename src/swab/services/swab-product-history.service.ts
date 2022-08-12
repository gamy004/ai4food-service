import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabProductHistory } from '../entities/swab-product-history.entity';


@Injectable()
export class SwabProductHistoryService extends CrudService<SwabProductHistory> {
  constructor(
    @InjectRepository(SwabProductHistory)
    repository: Repository<SwabProductHistory>
  ) {
    super(repository);
  }
}
