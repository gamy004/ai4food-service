import { Test, TestingModule } from '@nestjs/testing';
import { CleaningHistoryController } from './cleaning-history.controller';

describe('CleaningHistoryController', () => {
  let controller: CleaningHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleaningHistoryController],
    }).compile();

    controller = module.get<CleaningHistoryController>(
      CleaningHistoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
