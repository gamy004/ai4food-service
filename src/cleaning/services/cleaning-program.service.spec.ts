import { Test, TestingModule } from '@nestjs/testing';
import { CleaningProgramService } from './cleaning-program.service';

describe('CleaningProgramService', () => {
  let service: CleaningProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleaningProgramService],
    }).compile();

    service = module.get<CleaningProgramService>(CleaningProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
