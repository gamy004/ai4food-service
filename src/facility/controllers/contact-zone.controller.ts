import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactZoneService } from '../services/contact-zone.service';

@Controller('contact-zone')
@ApiTags('Facility')
export class ContactZoneController {
  constructor(private readonly contactZoneService: ContactZoneService) {}

  @Get()
  findAllcontactZone() {
    return this.contactZoneService.find();
  }
}
