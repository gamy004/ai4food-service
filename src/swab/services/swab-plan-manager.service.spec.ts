import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlanManagerService } from './swab-plan-manager.service';

describe('SwabPlanManagerService', () => {
  let service: SwabPlanManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabPlanManagerService],
    }).compile();

    service = module.get<SwabPlanManagerService>(SwabPlanManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
