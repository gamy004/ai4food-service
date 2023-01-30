import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BodyUpdateCleaningHistoryDto,
  ParamUpdateCleaningHistoryDto,
} from '../dto/update-cleaning-history.dto';
import { CleaningHistoryService } from '../services/cleaning-history.service';

@Controller('cleaning-history')
@ApiTags('Cleaning')
export class CleaningHistoryController {
  constructor(
    private readonly cleaningHistoryService: CleaningHistoryService,
  ) {}

  @Put(':id')
  async update(
    @Param() param: ParamUpdateCleaningHistoryDto,
    @Body() body: BodyUpdateCleaningHistoryDto,
  ) {
    return this.cleaningHistoryService.updateCleaningHistory(param, body);
  }
}
