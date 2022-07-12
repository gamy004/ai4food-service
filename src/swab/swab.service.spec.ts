import { Test, TestingModule } from '@nestjs/testing';
import { SwabService } from './swab.service';

describe('SwabService', () => {
  let service: SwabService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabService],
    }).compile();

    service = module.get<SwabService>(SwabService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
