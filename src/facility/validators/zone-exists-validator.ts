import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { Zone } from '../entities/zone.entity';

@ValidatorConstraint({ name: 'zoneExists', async: true })
@Injectable()
export class ZoneExistsRule extends EntityExistsRule<Zone> {
  constructor(
    @InjectRepository(Zone)
    repository: CommonRepositoryInterface<Zone>,
  ) {
    super(repository);
  }
}
