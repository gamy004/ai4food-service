import { Test, TestingModule } from '@nestjs/testing';
import { SwabTestQueryService } from './swab-test-query.service';

describe('SwabTestQueryService', () => {
  let service: SwabTestQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabTestQueryService],
    }).compile();

    service = module.get<SwabTestQueryService>(SwabTestQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
