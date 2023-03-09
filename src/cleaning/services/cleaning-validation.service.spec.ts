import { Test, TestingModule } from '@nestjs/testing';
import { CleaningValidationService } from './cleaning-validation.service';

describe('CleaningValidationService', () => {
  let service: CleaningValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningValidationService],
    }).compile();

    service = module.get<CleaningValidationService>(CleaningValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
