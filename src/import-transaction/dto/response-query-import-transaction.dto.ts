import { ImportTransaction } from '../entities/import-transaction.entity';

export class ResponseQueryImportTransactionDto {
  importTransactions: ImportTransaction[];
  total: number;
}
