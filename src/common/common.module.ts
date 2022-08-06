import { Module } from '@nestjs/common';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileExistsRule } from './validators/file-exists-validator';
import { TransactionDatasource } from './datasource/transaction.datasource';

@Module({
  imports: [
    TypeOrmModule.forFeature([File])
  ],

  controllers: [FileController],

  providers: [
    FileService,
    FileExistsRule,
    TransactionDatasource
  ],

  exports: [
    FileService,
    FileExistsRule,
    TransactionDatasource
  ]
})
export class CommonModule { }
