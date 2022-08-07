import { Test, TestingModule } from '@nestjs/testing';
import { SwabEnvironmentService } from './swab-environment.service';

describe('SwabEnvironmentService', () => {
  let service: SwabEnvironmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabEnvironmentService],
    }).compile();

    service = module.get<SwabEnvironmentService>(SwabEnvironmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
