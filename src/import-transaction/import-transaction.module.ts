import { Module } from '@nestjs/common';
import { ImportTransactionService } from './import-transaction.service';
import { ImportTransactionController } from './import-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportTransaction } from './entities/import-transaction.entity';
import { ImportTransactionExistsRule } from './validators/import-transaction-exists-validator';
import { IsImportTypeRule } from './validators/is-import-type-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportTransaction])
  ],
  controllers: [ImportTransactionController],
  providers: [ImportTransactionService, ImportTransactionExistsRule, IsImportTypeRule],
  exports: [ImportTransactionService]
})
export class ImportTransactionModule { }
