import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductScheduleService } from './product-schedule.service';
import { CreateProductScheduleDto } from './dto/create-product-schedule.dto';
import { UpdateProductScheduleDto } from './dto/update-product-schedule.dto';

@Controller('product-schedule')
export class ProductScheduleController {
  constructor(private readonly productScheduleService: ProductScheduleService) { }

  @Post()
  create(@Body() createProductScheduleDto: CreateProductScheduleDto) {
    return this.productScheduleService.create(createProductScheduleDto);
  }

  @Get()
  findAll() {
    return this.productScheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductScheduleDto: UpdateProductScheduleDto) {
    return this.productScheduleService.update(+id, updateProductScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productScheduleService.remove(+id);
  }
}
