import { Test, TestingModule } from '@nestjs/testing';
import { BacteriaSpecieService } from './bacteria-specie.service';

describe('BacteriaSpecieService', () => {
  let service: BacteriaSpecieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BacteriaSpecieService],
    }).compile();

    service = module.get<BacteriaSpecieService>(BacteriaSpecieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
