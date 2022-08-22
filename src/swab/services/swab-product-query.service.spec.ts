import { Test, TestingModule } from '@nestjs/testing';
import { SwabProductQueryService } from './swab-product-query.service';

describe('SwabProductQueryService', () => {
  let service: SwabProductQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabProductQueryService],
    }).compile();

    service = module.get<SwabProductQueryService>(SwabProductQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
