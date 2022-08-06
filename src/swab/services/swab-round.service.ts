import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CreateSwabPeriodDto } from '../dto/create-swab-period.dto';
import { UpdateSwabPeriodDto } from '../dto/update-swab-period.dto';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { SwabRound } from '../entities/swab-round.entity';


@Injectable()
export class SwabRoundService extends CrudService<SwabRound>{
  constructor(
    @InjectRepository(SwabRound)
    repository: CommonRepositoryInterface<SwabRound>

  ) {
    super(repository);
  }
}
