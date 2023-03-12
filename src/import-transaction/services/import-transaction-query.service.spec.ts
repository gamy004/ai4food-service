import { Test, TestingModule } from '@nestjs/testing';
import { ImportTransactionQueryService } from './import-transaction-query.service';

describe('ImportTransactionQueryService', () => {
  let service: ImportTransactionQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportTransactionQueryService],
    }).compile();

    service = module.get<ImportTransactionQueryService>(
      ImportTransactionQueryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
