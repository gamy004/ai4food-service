import { Test, TestingModule } from '@nestjs/testing';
import { SwabLabManagerService } from './swab-lab-manager.service';

describe('SwabLabManagerService', () => {
  let service: SwabLabManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabLabManagerService],
    }).compile();

    service = module.get<SwabLabManagerService>(SwabLabManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
