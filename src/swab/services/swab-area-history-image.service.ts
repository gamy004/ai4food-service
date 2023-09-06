import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabAreaHistoryImage } from '../entities/swab-area-history-image.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { IsNull } from 'typeorm';

@Injectable()
export class SwabAreaHistoryImageService extends CrudService<SwabAreaHistoryImage> {
  constructor(
    @InjectRepository(SwabAreaHistoryImage)
    repository: CommonRepositoryInterface<SwabAreaHistoryImage>,
  ) {
    super(repository);
  }
}
