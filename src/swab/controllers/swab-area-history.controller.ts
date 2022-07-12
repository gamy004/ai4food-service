import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateSwabAreaHistoryDto } from '../dto/create-swab-area-history.dto';
import { UpdateSwabAreaHistoryDto } from '../dto/update-swab-area-history.dto';
import { SwabAreaHistoryService } from '../services/swab-area-history.service';

@Controller('swab-area-history')
export class SwabAreaHistoryController {
  constructor(private readonly swabAreaHistoryService: SwabAreaHistoryService) { }

  @Post()
  create(@Body() createSwabAreaHistoryDto: CreateSwabAreaHistoryDto) {
    return this.swabAreaHistoryService.create(createSwabAreaHistoryDto);
  }

  @Get()
  findAll() {
    return this.swabAreaHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swabAreaHistoryService.findOne({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSwabAreaHistoryDto: UpdateSwabAreaHistoryDto) {
    return this.swabAreaHistoryService.update({ id }, updateSwabAreaHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.swabAreaHistoryService.remove({ id });
  }
}
