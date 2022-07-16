import { Test, TestingModule } from '@nestjs/testing';
import { SwabPeriodService } from '../services/swab-period.service';
import { SwabPeriodController } from './swab-period.controller';

describe('SwabPeriodController', () => {
  let controller: SwabPeriodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabPeriodController],
      providers: [SwabPeriodService],
    }).compile();

    controller = module.get<SwabPeriodController>(SwabPeriodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
