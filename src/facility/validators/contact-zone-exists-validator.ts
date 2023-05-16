import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatorConstraint } from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { EntityExistsRule } from '~/common/validators/entity-exists-validator';
import { ContactZone } from '../entities/contact-zone.entity';

@ValidatorConstraint({ name: 'contactZoneExists', async: true })
@Injectable()
export class ContactZoneExistsRule extends EntityExistsRule<ContactZone> {
  constructor(
    @InjectRepository(ContactZone)
    repository: CommonRepositoryInterface<ContactZone>,
  ) {
    super(repository);
  }
}
