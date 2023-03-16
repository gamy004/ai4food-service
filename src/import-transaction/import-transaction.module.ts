import { Module } from '@nestjs/common';
import { ImportTransactionService } from './services/import-transaction.service';
import { ImportTransactionController } from './import-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportTransaction } from './entities/import-transaction.entity';
import { ImportTransactionExistsRule } from './validators/import-transaction-exists-validator';
import { IsImportTypeRule } from './validators/is-import-type-validator';
import { ImportTransactionQueryService } from './services/import-transaction-query.service';
import { CommonModule } from '~/common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([ImportTransaction])],
  controllers: [ImportTransactionController],
  providers: [
    ImportTransactionService,
    ImportTransactionQueryService,
    ImportTransactionExistsRule,
    IsImportTypeRule,
  ],
  exports: [ImportTransactionService],
})
export class ImportTransactionModule {}
