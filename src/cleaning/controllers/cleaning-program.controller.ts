import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CleaningProgramService } from '../services/cleaning-program.service';

@Controller('cleaning-program')
@ApiTags('Cleaning')
export class CleaningProgramController {
  constructor(
    private readonly cleaningProgramService: CleaningProgramService,
  ) {}

  @Get()
  async findAll() {
    return this.cleaningProgramService.find();
  }
}
