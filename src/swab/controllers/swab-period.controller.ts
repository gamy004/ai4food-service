import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSwabPeriodDto } from '../dto/create-swab-period.dto';
import { UpdateSwabPeriodDto } from '../dto/update-swab-period.dto';
import { SwabPeriodService } from '../services/swab-period.service';

@Controller('swab-period')
@ApiTags('Swab')
export class SwabPeriodController {
  constructor(private readonly swabPeriodService: SwabPeriodService) {}

  @Get()
  findAll() {
    return this.swabPeriodService.find({ order: { swabPeriodOrder: 'asc' } });
  }
}
