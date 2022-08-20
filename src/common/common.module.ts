import { Module } from '@nestjs/common';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileExistsRule } from './validators/file-exists-validator';
import { TransactionDatasource } from './datasource/transaction.datasource';
import { DateTransformer } from './transformers/date-transformer';
import { RunningNumberService } from './services/running-number.service';
import { RunningNumberController } from './controllers/running-number.controller';
import { RunningNumber } from './entities/running-number.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      RunningNumber
    ])
  ],

  controllers: [
    FileController,
    RunningNumberController
  ],

  providers: [
    FileService,
    FileExistsRule,
    RunningNumberService,
    TransactionDatasource,
    DateTransformer
  ],

  exports: [
    FileService,
    FileExistsRule,
    RunningNumberService,
    TransactionDatasource,
    DateTransformer
  ]
})
export class CommonModule { }
