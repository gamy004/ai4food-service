import { Test, TestingModule } from '@nestjs/testing';
import { CleaningRoomHistoryService } from './cleaning-room-history.service';

describe('CleaningRoomHistoryService', () => {
  let service: CleaningRoomHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningRoomHistoryService],
    }).compile();

    service = module.get<CleaningRoomHistoryService>(
      CleaningRoomHistoryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
