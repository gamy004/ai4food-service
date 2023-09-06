import { Test, TestingModule } from '@nestjs/testing';
import { CleaningRoomHistoryController } from './cleaning-room-history.controller';

describe('CleaningRoomHistoryController', () => {
  let controller: CleaningRoomHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleaningRoomHistoryController],
    }).compile();

    controller = module.get<CleaningRoomHistoryController>(
      CleaningRoomHistoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
