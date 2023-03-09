import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { QuerySwabCleaningValidationDto } from '../dto/query-swab-cleaning-validation.dto';
import { SwabCleaningValidationQueryService } from '../services/swab-cleaning-validation-query.service';
import { SwabCleaningValidationSeedService } from '../services/swab-cleaning-validation-seed.service';

@Controller('swab/cleaning-validation')
@ApiTags('Swab')
export class SwabCleaningValidationController {
  constructor(
    private readonly swabCleaningValidationQueryService: SwabCleaningValidationQueryService,
    private readonly swabCleaningValidationSeedService: SwabCleaningValidationSeedService,
  ) {}

  @Authenticated()
  @Get()
  querySwabCleaningValidation(@Query() dto: QuerySwabCleaningValidationDto) {
    return this.swabCleaningValidationQueryService.query(dto);
  }

  @Post('seed')
  seed() {
    return this.swabCleaningValidationSeedService.seed();
  }
}
