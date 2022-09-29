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
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { FindAllSwabAreaQuery } from '../dto/find-all-swab-area-query.dto';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import { SwabAreaService } from '../services/swab-area.service';
import { query } from 'express';

@Controller('swab/area')
@ApiTags('Swab')
export class SwabAreaController {
  constructor(private readonly swabAreaService: SwabAreaService) {}

  @Get('main')
  findAllMainArea(@Query() query: FindAllSwabAreaQuery) {
    return this.swabAreaService.findAllMainArea(query);
  }  

  // @Authenticated()
  @Post()
  createSwabArea(@Body() createSwabAreaDto: CreateSwabAreaDto) {
    return this.swabAreaService.createSwabArea(createSwabAreaDto);
  }
}
