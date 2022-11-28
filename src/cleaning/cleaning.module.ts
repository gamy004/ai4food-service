import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '~/common/common.module';
import { ImportTransactionModule } from '~/import-transaction/import-transaction.module';
import { CleaningRoomHistoryController } from './controllers/cleaning-room-history.controller';
import { CleaningPlan } from './entities/cleaning-plan.entity';
import { CleaningProgram } from './entities/cleaning-program.entity';
import { CleaningRoomHistory } from './entities/cleaning-room-history.entity';
import { CleaningPlanService } from './services/cleaning-plan.service';
import { CleaningProgramService } from './services/cleaning-program.service';
import { CleaningRoomHistoryImporter } from './services/cleaning-room-history.importer';
import { CleaningRoomHistoryService } from './services/cleaning-room-history.service';
import { CleaningPlanExistsRule } from './validators/cleaning-plan-exists-validator';
import { CleaningProgramExistsRule } from './validators/cleaning-program-exists-validator';
import { CleaningRoomHistoryExistsRule } from './validators/cleaning-room-history-exists-validator';

@Module({
  imports: [
    ImportTransactionModule,
    CommonModule,
    TypeOrmModule.forFeature([
      CleaningPlan,
      CleaningProgram,
      CleaningRoomHistory,
    ]),
  ],
  controllers: [CleaningRoomHistoryController],

  providers: [
    CleaningPlanService,
    CleaningProgramService,
    CleaningRoomHistoryService,
    CleaningPlanExistsRule,
    CleaningProgramExistsRule,
    CleaningRoomHistoryExistsRule,
    {
      provide: 'DataCollectorImporterInterface<CleaningRoomHistory>',
      useClass: CleaningRoomHistoryImporter,
    },
  ],
  exports: [
    CleaningPlanService,
    CleaningProgramService,
    CleaningRoomHistoryService,
    CleaningPlanExistsRule,
    CleaningProgramExistsRule,
    CleaningRoomHistoryExistsRule,
  ],
})
export class CleaningModule {}
