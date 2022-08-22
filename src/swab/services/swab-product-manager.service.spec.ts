import { Test, TestingModule } from '@nestjs/testing';
import { SwabProductManagerService } from './swab-product-manager.service';

describe('SwabProductManagerService', () => {
  let service: SwabProductManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabProductManagerService],
    }).compile();

    service = module.get<SwabProductManagerService>(SwabProductManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
