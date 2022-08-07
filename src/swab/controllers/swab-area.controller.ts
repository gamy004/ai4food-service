import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import { SwabAreaService } from '../services/swab-area.service';

@Controller('swab/area')
export class SwabAreaController {
  constructor(private readonly swabAreaService: SwabAreaService) { }

  // @Post()
  // create(@Body() createSwabAreaDto: CreateSwabAreaDto) {
  //   return this.swabAreaService.create(createSwabAreaDto);
  // }

  // @Get()
  // findAll() {
  //   return this.swabAreaService.findAll();
  // }

  @Get('main')
  findAllMainArea() {
    return this.swabAreaService.findAllMainArea();
  }
}
