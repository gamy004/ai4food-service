import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateSwabEnvironmentDto } from '../dto/create-swab-environment.dto';
import { UpdateSwabEnvironmentDto } from '../dto/update-swab-environment.dto';
import { SwabEnvironmentService } from '../services/swab-environment.service';

@Controller('swab-environment')
export class SwabEnvironmentController {
  constructor(private readonly swabEnvironmentService: SwabEnvironmentService) { }

  @Get()
  findAll() {
    return this.swabEnvironmentService.findAll();
  }
}
