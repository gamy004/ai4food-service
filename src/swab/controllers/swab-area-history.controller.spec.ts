import { Test, TestingModule } from '@nestjs/testing';
import { SwabAreaHistoryController } from '../controllers/swab-area-history.controller';
import { SwabAreaHistoryService } from '../services/swab-area-history.service';

describe('SwabAreaHistoryController', () => {
  let controller: SwabAreaHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabAreaHistoryController],
      providers: [SwabAreaHistoryService],
    }).compile();

    controller = module.get<SwabAreaHistoryController>(
      SwabAreaHistoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
