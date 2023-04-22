import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { ContactZone } from '../entities/contact-zone.entity';

@Injectable()
export class ContactZoneService extends CrudService<ContactZone> {
  constructor(
    @InjectRepository(ContactZone)
    repository: CommonRepositoryInterface<ContactZone>,
  ) {
    super(repository);
  }
}
