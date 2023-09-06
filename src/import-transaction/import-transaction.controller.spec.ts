import { Test, TestingModule } from '@nestjs/testing';
import { ImportTransactionController } from './import-transaction.controller';
import { ImportTransactionService } from './import-transaction.service';

describe('ImportTransactionController', () => {
  let controller: ImportTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportTransactionController],
      providers: [ImportTransactionService],
    }).compile();

    controller = module.get<ImportTransactionController>(
      ImportTransactionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
