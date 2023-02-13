import { Test, TestingModule } from '@nestjs/testing';
import { CleaningHistoryQueryService } from './cleaning-history-query.service';

describe('CleaningHistoryQueryService', () => {
  let service: CleaningHistoryQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningHistoryQueryService],
    }).compile();

    service = module.get<CleaningHistoryQueryService>(
      CleaningHistoryQueryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
