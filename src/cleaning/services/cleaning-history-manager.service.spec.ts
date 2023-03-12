import { Test, TestingModule } from '@nestjs/testing';
import { CleaningHistoryManagerService } from './cleaning-history-manager.service';

describe('CleaningHistoryManagerService', () => {
  let service: CleaningHistoryManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningHistoryManagerService],
    }).compile();

    service = module.get<CleaningHistoryManagerService>(
      CleaningHistoryManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
