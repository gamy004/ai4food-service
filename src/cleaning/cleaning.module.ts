import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleaningPlan } from './entities/cleaning-plan.entity';
import { CleaningProgram } from './entities/cleaning-program.entity';
import { CleaningRoomHistory } from './entities/cleaning-room-history.entity';
import { CleaningPlanService } from './services/cleaning-plan.service';
import { CleaningProgramService } from './services/cleaning-program.service';
import { CleaningRoomHistoryService } from './services/cleaning-room-history.service';
import { CleaningPlanExistsRule } from './validators/cleaning-plan-exists-validator';
import { CleaningProgramExistsRule } from './validators/cleaning-program-exists-validator';
import { CleaningRoomHistoryExistsRule } from './validators/cleaning-room-history-exists-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CleaningPlan,
      CleaningProgram,
      CleaningRoomHistory,
    ]),
  ],
  controllers: [],
  providers: [
    CleaningPlanService,
    CleaningProgramService,
    CleaningRoomHistoryService,
    CleaningPlanExistsRule,
    CleaningProgramExistsRule,
    CleaningRoomHistoryExistsRule,
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
