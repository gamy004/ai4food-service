import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlannerService } from '../services/swab-planner.service';
import { SwabPlanController } from './swab-plan.controller';

describe('SwabPlanController', () => {
  let controller: SwabPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabPlanController],
      providers: [SwabPlannerService],
    }).compile();

    controller = module.get<SwabPlanController>(SwabPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
