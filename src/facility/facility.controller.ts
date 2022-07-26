import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilityItemService } from './facility-item.service';
import { Not, IsNull } from 'typeorm';

@Controller('facility')
export class FacilityController {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly facilityItemService: FacilityItemService,
  ) { }

  // @Post()
  // create(@Body() createFacilityDto: CreateFacilityDto) {
  //   return this.facilityService.create(createFacilityDto);
  // }

  @Get()
  findAll() {
    return this.facilityService.findAll();
  }

  @Get('items')
  findAllItems() {
    return this.facilityItemService.findAll();
  }

  @Get('swab-items')
  findAllSwabItems() {
    // return this.facilityItemService.findAll({
    //   where: {
    //     swabAreas: {
    //       id: Not(IsNull())
    //     }
    //   }
    // });
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.facilityService.findOne({ id });
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto) {
  //   return this.facilityService.update({ id }, updateFacilityDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.facilityService.remove({ id });
  // }
}
