import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { RiskZone } from '../entities/risk-zone.entity';

@ValidatorConstraint({ name: 'riskZoneExists', async: true })
@Injectable()
export class RiskZoneExistsRule extends EntityExistsRule<RiskZone> {
  constructor(
    @InjectRepository(RiskZone)
    repository: CommonRepositoryInterface<RiskZone>,
  ) {
    super(repository);
  }
}
