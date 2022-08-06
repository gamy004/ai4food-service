import { Test, TestingModule } from '@nestjs/testing';
import { SwabRoundService } from './swab-round.service';

describe('SwabRoundService', () => {
  let service: SwabRoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabRoundService],
    }).compile();

    service = module.get<SwabRoundService>(SwabRoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
