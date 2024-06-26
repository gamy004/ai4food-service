import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindAllBacteriaSpecieQuery } from '../dto/find-all-bacteria-specie-query.dto';
import { BacteriaSpecieService } from '../services/bacteria-specie.service';

@Controller('bacteria-specie')
@ApiTags('Lab')
export class BacteriaSpecieController {
  constructor(private readonly BacteriaSpecieService: BacteriaSpecieService) {}

  @Get()
  findAll(@Query() findAllBacteriaSpecieQuery: FindAllBacteriaSpecieQuery) {
    return this.BacteriaSpecieService.find({
      where: findAllBacteriaSpecieQuery,
    });
  }
}
