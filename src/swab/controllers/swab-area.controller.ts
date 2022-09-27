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
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { FindAllSwabAreaQueryDto } from '../dto/find-all-swab-area-query.dto';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import { SwabAreaService } from '../services/swab-area.service';

@Controller('swab/area')
export class SwabAreaController {
  constructor(private readonly swabAreaService: SwabAreaService) {}

  @Get('main')
  findAllMainArea(@Query() findAllSwabAreaQueryDto: FindAllSwabAreaQueryDto) {
    return this.swabAreaService.findAllMainArea(findAllSwabAreaQueryDto);
  }  

  // @Authenticated()
  @Post()
  createSwabArea(@Body() createSwabAreaDto: CreateSwabAreaDto) {
    return this.swabAreaService.createSwabArea(createSwabAreaDto);
  }
}
