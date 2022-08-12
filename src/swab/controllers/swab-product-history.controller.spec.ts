import { Test, TestingModule } from '@nestjs/testing';
import { SwabProductHistoryController } from './swab-product-history.controller';
import { SwabProductHistoryService } from '../services/swab-product-history.service';

describe('SwabProductHistoryController', () => {
  let controller: SwabProductHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabProductHistoryController],
      providers: [SwabProductHistoryService],
    }).compile();

    controller = module.get<SwabProductHistoryController>(SwabProductHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
