import { Test, TestingModule } from '@nestjs/testing';
import { SensorMappingService } from './sensor-mapping.service';

describe('SensorMappingService', () => {
  let service: SensorMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorMappingService],
    }).compile();

    service = module.get<SensorMappingService>(SensorMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
