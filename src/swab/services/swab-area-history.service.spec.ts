import { Test, TestingModule } from '@nestjs/testing';
import { SwabAreaHistoryService } from '../services/swab-area-history.service';

describe('SwabAreaHistoryService', () => {
  let service: SwabAreaHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabAreaHistoryService],
    }).compile();

    service = module.get<SwabAreaHistoryService>(SwabAreaHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
