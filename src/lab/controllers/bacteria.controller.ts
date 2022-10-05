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
import { FindAllBacteriaQuery } from '../dto/find-all-bacteria-query.dto';
import { BacteriaService } from '../services/bacteria.service';

@Controller('bacteria')
@ApiTags('Lab')
export class BacteriaController {
  constructor(private readonly bacteriaService: BacteriaService) {}

  @Get()
  findAll(@Query() query: FindAllBacteriaQuery) {
    const options = this.bacteriaService.toFilter(query);
    console.log(options);

    return this.bacteriaService.find(options);
  }
}
