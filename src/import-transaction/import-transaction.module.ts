import { Module } from '@nestjs/common';
import { ImportTransactionService } from './import-transaction.service';
import { ImportTransactionController } from './import-transaction.controller';

@Module({
  controllers: [ImportTransactionController],
  providers: [ImportTransactionService]
})
export class ImportTransactionModule {}
