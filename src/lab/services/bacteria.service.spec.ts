import { Test, TestingModule } from '@nestjs/testing';
import { BacteriaService } from './bacteria.service';

describe('BacteriaService', () => {
  let service: BacteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BacteriaService],
    }).compile();

    service = module.get<BacteriaService>(BacteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
