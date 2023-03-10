import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CleaningValidationService } from '../services/cleaning-validation.service';

@Controller('cleaning-validation')
@ApiTags('Cleaning')
export class CleaningValidationController {
  constructor(
    private readonly cleaningValidationService: CleaningValidationService,
  ) {}
}
