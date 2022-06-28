import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataCollectorService } from './data-collector.service';

@Controller('data-collector')
export class DataCollectorController {
  constructor(
    private readonly dataCollectorService: DataCollectorService
  ) { }

  // @Post()
  // create(@Body() createImportTransactionDto: CreateImportTransactionDto) {
  //   return this.dataCollectorService.create(createImportTransactionDto);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateImportTransactionDto: UpdateImportTransactionDto) {
  //   return this.dataCollectorService.update(+id, updateImportTransactionDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataCollectorService.remove(+id);
  }
}
