import { Test, TestingModule } from '@nestjs/testing';
import { SwabTestService } from './swab-test.service';

describe('SwabTestService', () => {
  let service: SwabTestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabTestService],
    }).compile();

    service = module.get<SwabTestService>(SwabTestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
