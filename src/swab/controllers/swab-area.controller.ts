import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import { BodyUpdateSwabAreaDto, ParamUpdateSwabAreaDto } from '../dto/update-swab-area.dto';
import { SwabAreaService } from '../services/swab-area.service';

@Controller('swab/area')
@ApiTags('Swab')
export class SwabAreaController {
  constructor(private readonly swabAreaService: SwabAreaService) { }

  @Get('main')
  findAllMainArea() {
    return this.swabAreaService.findAllMainArea();
  }

  // @Authenticated()
  @Post()
  createSwabArea(@Body() createSwabAreaDto: CreateSwabAreaDto) {
    return this.swabAreaService.createSwabArea(createSwabAreaDto);
  }

  // @Authenticated()
  @Put(':id')
  async update(
    @Param() param: ParamUpdateSwabAreaDto,
    @Body() body: BodyUpdateSwabAreaDto,
  ) {
    return this.swabAreaService.updateSwabArea(param, body);
  }
}
