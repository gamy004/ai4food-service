import { Test, TestingModule } from '@nestjs/testing';
import { SwabAreaService } from './swab-area.service';

describe('SwabAreaService', () => {
  let service: SwabAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabAreaService],
    }).compile();

    service = module.get<SwabAreaService>(SwabAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
