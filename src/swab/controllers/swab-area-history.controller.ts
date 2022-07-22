import { Controller, Get, Param, Delete } from '@nestjs/common';
import { SwabAreaHistoryService } from '../services/swab-area-history.service';

@Controller('swab-area-history')
export class SwabAreaHistoryController {
  constructor(private readonly swabAreaHistoryService: SwabAreaHistoryService) { }

  // @Get()
  // findAll() {
  //   return this.swabAreaHistoryService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swabAreaHistoryService.findOne({ id });
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.swabAreaHistoryService.remove({ id });
  // }
}
