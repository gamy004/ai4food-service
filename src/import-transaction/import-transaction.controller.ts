import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImportTransactionService } from './import-transaction.service';
import { CreateImportTransactionDto } from './dto/create-import-transaction.dto';
import { UpdateImportTransactionDto } from './dto/update-import-transaction.dto';
import { ImportStatus } from './entities/import-transaction.entity';

@Controller('import-transaction')
export class ImportTransactionController {
  constructor(
    private readonly importTransactionService: ImportTransactionService
    ) {}

  @Post()
  create(@Body() createImportTransactionDto: CreateImportTransactionDto) {
    return this.importTransactionService.create(createImportTransactionDto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.importTransactionService.complete(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.importTransactionService.cancel(id);
  }
}
