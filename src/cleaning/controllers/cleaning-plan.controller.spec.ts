import { Test, TestingModule } from '@nestjs/testing';
import { CleaningPlanController } from './cleaning-plan.controller';

describe('CleaningPlanController', () => {
  let controller: CleaningPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleaningPlanController],
    }).compile();

    controller = module.get<CleaningPlanController>(CleaningPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
