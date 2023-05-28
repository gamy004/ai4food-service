import { Test, TestingModule } from '@nestjs/testing';
import { SwabSampleTypeService } from './swab-sample-type.service';

describe('SwabSampleTypeService', () => {
  let service: SwabSampleTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabSampleTypeService],
    }).compile();

    service = module.get<SwabSampleTypeService>(SwabSampleTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
