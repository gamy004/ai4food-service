import { Test, TestingModule } from '@nestjs/testing';
import { SwabTestService } from '../services/swab-test.service';
import { SwabTestController } from './swab-test.controller';

describe('SwabTestController', () => {
  let controller: SwabTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabTestController],
      providers: [SwabTestService],
    }).compile();

    controller = module.get<SwabTestController>(SwabTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
