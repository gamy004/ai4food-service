import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SwabService } from '../services/swab.service';
import { CreateSwabDto } from '../dto/create-swab.dto';
import { UpdateSwabDto } from '../dto/update-swab.dto';

@Controller('swab')
export class SwabController {
  constructor(private readonly swabService: SwabService) { }

  @Post()
  create(@Body() createSwabDto: CreateSwabDto) {
    return this.swabService.create(createSwabDto);
  }

  @Get()
  findAll() {
    return this.swabService.findAll();
  }

  @Get('generate-swab-plan')
  generateSwabPlan() {
    return this.swabService.generateSwabPlan();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swabService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSwabDto: UpdateSwabDto) {
    return this.swabService.update(+id, updateSwabDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.swabService.remove(+id);
  }
}
