import { Test, TestingModule } from '@nestjs/testing';
import { SwabProductHistoryService } from './swab-product-history.service';

describe('SwabProductHistoryService', () => {
  let service: SwabProductHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabProductHistoryService],
    }).compile();

    service = module.get<SwabProductHistoryService>(SwabProductHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
