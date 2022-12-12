import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { CleaningRoomHistory } from '../entities/cleaning-room-history.entity';

@ValidatorConstraint({ name: 'cleaningRoomHistoryExists', async: true })
@Injectable()
export class CleaningRoomHistoryExistsRule extends EntityExistsRule<CleaningRoomHistory> {
  constructor(
    @InjectRepository(CleaningRoomHistory)
    repository: CommonRepositoryInterface<CleaningRoomHistory>,
  ) {
    super(repository);
  }
}
