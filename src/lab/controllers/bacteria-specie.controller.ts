import { Controller, Get } from '@nestjs/common';
import { BacteriaSpecieService } from '../services/bacteria-specie.service';

@Controller('bacteria-specie')
export class BacteriaSpecieController {
  constructor(private readonly BacteriaSpecieService: BacteriaSpecieService) {}

  @Get()
  findAll() {
    return this.BacteriaSpecieService.find();
  }
}
