import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlannerService } from '../services/swab-planner.service';
import { SwabPlanItemController } from './swab-plan-item.controller';

describe('SwabPlanItemController', () => {
  let controller: SwabPlanItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabPlanItemController],
      providers: [SwabPlannerService],
    }).compile();

    controller = module.get<SwabPlanItemController>(SwabPlanItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
