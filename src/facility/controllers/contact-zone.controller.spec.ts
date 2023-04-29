import { Test, TestingModule } from '@nestjs/testing';
import { ContactZoneController } from './contact-zone.controller';
import { ContactZoneService } from '../services/contact-zone.service';

describe('ContactZoneController', () => {
  let controller: ContactZoneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactZoneController],
      providers: [ContactZoneService],
    }).compile();

    controller = module.get<ContactZoneController>(ContactZoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
