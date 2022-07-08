import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImportTransactionService } from './import-transaction.service';
import { CreateImportTransactionDto } from './dto/create-import-transaction.dto';
import { UpdateImportTransactionDto } from './dto/update-import-transaction.dto';
import { ImportStatus } from './entities/import-transaction.entity';
import { ConnectImportTransactionDto } from './dto/connect-import-transaction.dto';
import { ParamImportTransactionDto } from './dto/param-import-transaction.dto';

@Controller('import-transaction')
export class ImportTransactionController {
  constructor(
    private readonly importTransactionService: ImportTransactionService
  ) { }

  @Post()
  create(@Body() createImportTransactionDto: CreateImportTransactionDto) {
    return this.importTransactionService.create(createImportTransactionDto);
  }

  @Patch(':id/complete')
  complete(@Param() params: ParamImportTransactionDto) {
    return this.importTransactionService.complete(params.id);
  }

  @Patch(':id/cancel')
  cancel(@Param() params: ParamImportTransactionDto) {
    return this.importTransactionService.cancel(params.id);
  }
}
