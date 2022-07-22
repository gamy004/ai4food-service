import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateSwabEnvironmentDto } from '../dto/create-swab-environment.dto';
import { UpdateSwabEnvironmentDto } from '../dto/update-swab-environment.dto';
import { SwabEnvironmentService } from '../services/swab-environment.service';

@Controller('swab-environment')
export class SwabEnvironmentController {
  constructor(private readonly swabEnvironmentService: SwabEnvironmentService) { }

  // @Post()
  // create(@Body() createSwabEnvironmentDto: CreateSwabEnvironmentDto) {
  //   return this.swabEnvironmentService.create(createSwabEnvironmentDto);
  // }

  @Get()
  findAll() {
    return this.swabEnvironmentService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.swabEnvironmentService.findOne({ id });
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSwabEnvironmentDto: UpdateSwabEnvironmentDto) {
  //   return this.swabEnvironmentService.update({ id }, updateSwabEnvironmentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.swabEnvironmentService.remove({ id });
  // }
}
