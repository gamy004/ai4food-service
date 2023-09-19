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
import { Unique } from './validators/unique-validator';
import { CollectionTransformer } from './transformers/collection-transformer';
import { RelationField } from './validators/relation-field-validator';
@Module({
  imports: [TypeOrmModule.forFeature([File, RunningNumber])],

  controllers: [FileController, RunningNumberController],

  providers: [
    FileService,
    FileExistsRule,
    RunningNumberService,
    TransactionDatasource,
    Unique,
    DateTransformer,
    CollectionTransformer,
    RelationField,
  ],

  exports: [
    FileService,
    FileExistsRule,
    Unique,
    RunningNumberService,
    TransactionDatasource,
    DateTransformer,
    CollectionTransformer,
    RelationField,
  ],
})
export class CommonModule {}
