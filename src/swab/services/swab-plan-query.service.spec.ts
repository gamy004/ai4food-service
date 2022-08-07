import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlanQueryService } from './swab-plan-query.service';

describe('SwabPlanQueryService', () => {
  let service: SwabPlanQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabPlanQueryService],
    }).compile();

    service = module.get<SwabPlanQueryService>(SwabPlanQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
