import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityItemService } from './facility-item.service';
import { Not, IsNull, FindOptionsWhere } from 'typeorm';
import { QueryFindAllFacilityItemDto } from './dto/query-find-all-facility-item.dto';
import { FacilityItem } from './entities/facility-item.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('facility')
@ApiTags('Facility')
export class FacilityController {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly facilityItemService: FacilityItemService,
  ) {}

  // @Post()
  // create(@Body() createFacilityDto: CreateFacilityDto) {
  //   return this.facilityService.create(createFacilityDto);
  // }

  @Get()
  findAllFacility() {
    return this.facilityService.find();
  }

  @Get('swab-item')
  findAllSwabItems() {
    return this.facilityService.find({
      where: {
        swabAreas: {
          id: Not(IsNull()),
        },
      },
    });
  }

  @Get('item')
  findAllFacilityItem(@Query() param: QueryFindAllFacilityItemDto) {
    const where: FindOptionsWhere<FacilityItem> = {};

    if (param.facilityId) {
      where.facilityId = param.facilityId;
    }

    return this.facilityItemService.find({ where });
  }
}
