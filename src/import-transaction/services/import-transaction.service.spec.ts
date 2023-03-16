import { Test, TestingModule } from '@nestjs/testing';
import { ImportTransactionService } from './import-transaction.service';

describe('ImportTransactionService', () => {
  let service: ImportTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportTransactionService],
    }).compile();

    service = module.get<ImportTransactionService>(ImportTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
