import { Test, TestingModule } from '@nestjs/testing';
import { SwabLabQueryService } from './swab-lab-query.service';

describe('SwabLabQueryService', () => {
  let service: SwabLabQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabLabQueryService],
    }).compile();

    service = module.get<SwabLabQueryService>(SwabLabQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
