import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CleaningHistoryService } from '../services/cleaning-history.service';

@Controller('cleaning-history')
@ApiTags('Cleaning')
export class CleaningHistoryController {
  constructor(
    private readonly cleaningHistoryService: CleaningHistoryService,
  ) {}
}
