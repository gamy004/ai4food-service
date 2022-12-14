import { Body, Controller, Inject, Post } from '@nestjs/common';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import { ImportTransactionService } from '~/import-transaction/import-transaction.service';
import { ApiTags } from '@nestjs/swagger';
import { CleaningPlan } from '../entities/cleaning-plan.entity';
import { ImportCleaningPlanDto } from '../dto/import-cleaning-plan.dto';

@Controller('cleaning-plan')
@ApiTags('Cleaning')
export class CleaningPlanController {
  constructor(
    private readonly importTransactionService: ImportTransactionService,
    @Inject('DataCollectorImporterInterface<CleaningPlan>')
    private readonly cleaningPlanImporter: DataCollectorImporterInterface<CleaningPlan>,
  ) {}

  @Post('import')
  async import(
    @Body() importCleaningPlanDto: ImportCleaningPlanDto,
  ): Promise<void> {
    const importTransaction = await this.importTransactionService.findOneBy(
      importCleaningPlanDto.importTransaction,
    );

    if (importCleaningPlanDto.timezone) {
      this.cleaningPlanImporter.setTimezone(importCleaningPlanDto.timezone);
    }

    return this.cleaningPlanImporter.import(
      importTransaction,
      CleaningPlan.create<CleaningPlan>(importCleaningPlanDto.records),
    );
  }
}
