import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityItemService } from './facility-item.service';
import { Not, IsNull, FindOptionsWhere } from 'typeorm';
import { QueryFindAllFacilityItemDto } from './dto/query-find-all-facility-item.dto';
import { FacilityItem } from './entities/facility-item.entity';

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

  // @Get()
  // findAll() {
  //   return this.facilityService.findAll();
  // }

  // @Get('items')
  // findAllItems() {
  //   return this.facilityItemService.findAll();
  // }

  @Get('swab-item')
  findAllSwabItems() {
    return this.facilityService.findAll({
      where: {
        swabAreas: {
          id: Not(IsNull())
        }
      }
    });
  }

  @Get('item')
  findAllFacilityItem(@Query() param: QueryFindAllFacilityItemDto) {
    const where: FindOptionsWhere<FacilityItem> = {};

    if (param.facilityId) {
      where.facilityId = param.facilityId;
    }

    return this.facilityItemService.findAll({ where });
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
