import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '~/common/common.module';
import { ImportTransactionModule } from '~/import-transaction/import-transaction.module';
import { CleaningHistoryController } from './controllers/cleaning-history.controller';
import { CleaningRoomHistoryController } from './controllers/cleaning-room-history.controller';
import { CleaningHistoryCleaningValidation } from './entities/cleaning-history-cleaning-validation.entity';
import { CleaningHistory } from './entities/cleaning-history.entity';
import { CleaningPlan } from './entities/cleaning-plan.entity';
import { CleaningProgram } from './entities/cleaning-program.entity';
import { CleaningRoomHistory } from './entities/cleaning-room-history.entity';
import { CleaningHistoryService } from './services/cleaning-history.service';
import { CleaningPlanService } from './services/cleaning-plan.service';
import { CleaningProgramService } from './services/cleaning-program.service';
import { CleaningRoomHistoryImporter } from './services/cleaning-room-history.importer';
import { CleaningRoomHistoryService } from './services/cleaning-room-history.service';
import { CleaningHistoryExistsRule } from './validators/cleaning-history-exists-validator';
import { CleaningPlanExistsRule } from './validators/cleaning-plan-exists-validator';
import { CleaningProgramExistsRule } from './validators/cleaning-program-exists-validator';
import { CleaningRoomHistoryExistsRule } from './validators/cleaning-room-history-exists-validator';

@Module({
  imports: [
    ImportTransactionModule,
    CommonModule,
    TypeOrmModule.forFeature([
      CleaningPlan,
      CleaningHistory,
      CleaningProgram,
      CleaningRoomHistory,
      CleaningHistoryCleaningValidation,
    ]),
  ],
  controllers: [CleaningRoomHistoryController, CleaningHistoryController],

  providers: [
    CleaningPlanService,
    CleaningProgramService,
    CleaningRoomHistoryService,
    CleaningHistoryService,
    CleaningPlanExistsRule,
    CleaningProgramExistsRule,
    CleaningRoomHistoryExistsRule,
    CleaningHistoryExistsRule,
    {
      provide: 'DataCollectorImporterInterface<CleaningRoomHistory>',
      useClass: CleaningRoomHistoryImporter,
    },
  ],
  exports: [
    CleaningPlanService,
    CleaningProgramService,
    CleaningRoomHistoryService,
    CleaningHistoryService,
    CleaningPlanExistsRule,
    CleaningProgramExistsRule,
    CleaningRoomHistoryExistsRule,
    CleaningHistoryExistsRule,
  ],
})
export class CleaningModule {}
