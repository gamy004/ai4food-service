import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImportTransactionService } from './import-transaction.service';
import { CreateImportTransactionDto } from './dto/create-import-transaction.dto';
import { UpdateImportTransactionDto } from './dto/update-import-transaction.dto';

@Controller('import-transaction')
export class ImportTransactionController {
  constructor(private readonly importTransactionService: ImportTransactionService) {}

  @Post()
  create(@Body() createImportTransactionDto: CreateImportTransactionDto) {
    return this.importTransactionService.create(createImportTransactionDto);
  }

  @Get()
  findAll() {
    return this.importTransactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importTransactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImportTransactionDto: UpdateImportTransactionDto) {
    return this.importTransactionService.update(+id, updateImportTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importTransactionService.remove(+id);
  }
}
