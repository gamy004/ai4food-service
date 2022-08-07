import { Test, TestingModule } from '@nestjs/testing';
import { SwabController } from '../controllers/swab.controller';
import { SwabPlanManagerService } from '../services/swab-plan-manager.service';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';

describe('SwabController', () => {
  let controller: SwabController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabController],
      providers: [SwabPlanQueryService, SwabPlanManagerService],
    }).compile();

    controller = module.get<SwabController>(SwabController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
