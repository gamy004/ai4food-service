import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwabSampleTypeService } from '../services/swab-sample-type.service';
import { SwabSampleTypeSeedService } from '../services/swab-sample-type-seed.service';

@Controller('swab-sample-type')
@ApiTags('Swab')
export class SwabSampleTypeController {
  constructor(
    private readonly swabSampleTypeService: SwabSampleTypeService,
    private readonly swabSampleTypeSeedService: SwabSampleTypeSeedService,
  ) {}

  @Get()
  findAll() {
    return this.swabSampleTypeService.find();
  }

  @Post('seed')
  seed() {
    return this.swabSampleTypeSeedService.seed();
  }
}
