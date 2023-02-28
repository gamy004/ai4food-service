import { Test, TestingModule } from '@nestjs/testing';
import { CleaningHistoryService } from './cleaning-history.service';

describe('CleaningHistoryService', () => {
  let service: CleaningHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningHistoryService],
    }).compile();

    service = module.get<CleaningHistoryService>(CleaningHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
