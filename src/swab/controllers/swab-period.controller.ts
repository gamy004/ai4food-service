import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateSwabPeriodDto } from '../dto/create-swab-period.dto';
import { UpdateSwabPeriodDto } from '../dto/update-swab-period.dto';
import { SwabPeriodService } from '../services/swab-period.service';

@Controller('swab-period')
export class SwabPeriodController {
  constructor(private readonly swabPeriodService: SwabPeriodService) { }

  // @Post()
  // create(@Body() createSwabPeriodDto: CreateSwabPeriodDto) {
  //   return this.swabPeriodService.create(createSwabPeriodDto);
  // }

  @Get()
  findAll() {
    return this.swabPeriodService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.swabPeriodService.findOne({ id });
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSwabPeriodDto: UpdateSwabPeriodDto) {
  //   return this.swabPeriodService.update({ id }, updateSwabPeriodDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.swabPeriodService.remove({ id });
  // }
}
