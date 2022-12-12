import { Test, TestingModule } from '@nestjs/testing';
import { CleaningPlanService } from './cleaning-plan.service';

describe('CleaningPlanService', () => {
  let service: CleaningPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningPlanService],
    }).compile();

    service = module.get<CleaningPlanService>(CleaningPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
