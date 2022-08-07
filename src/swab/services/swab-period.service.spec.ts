import { Test, TestingModule } from '@nestjs/testing';
import { SwabPeriodService } from './swab-period.service';

describe('SwabPeriodService', () => {
  let service: SwabPeriodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabPeriodService],
    }).compile();

    service = module.get<SwabPeriodService>(SwabPeriodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
