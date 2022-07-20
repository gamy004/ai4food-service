import { Module } from '@nestjs/common';
import { SwabService } from './services/swab.service';
import { SwabController } from './controllers/swab.controller';
import { SwabAreaHistoryController } from './controllers/swab-area-history.controller';
import { SwabAreaHistoryService } from './services/swab-area-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwabAreaHistory } from './entities/swab-area-history.entity';
import { SwabAreaHistoryImage } from './entities/swab-area-history-image.entity';
import { SwabPeriodController } from './controllers/swab-period.controller';
import { SwabPeriodService } from './services/swab-period.service';
import { SwabArea } from './entities/swab-area.entity';
import { SwabPeriod } from './entities/swab-period.entity';
import { SwabTest } from './entities/swab-test.entity';
import { SwabAreaService } from './services/swab-area.service';
import { SwabAreaController } from './controllers/swab-area.controller';
import { FacilityModule } from '~/facility/facility.module';
import { SwabAreaExistsRule } from './validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from './validators/swab-period-exists-validator';
import { SwabAreaHistoryExistsRule } from './validators/swab-area-history-exists-validator';
import { SwabEnvironment } from './entities/swab-environment.entity';
import { SwabEnvironmentExistsRule } from './validators/swab-environment-exists-validator';
import { SwabAreaHistoryImageExistsRule } from './validators/swab-area-history-image-exists-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SwabAreaHistory,
      SwabAreaHistoryImage,
      SwabArea,
      SwabPeriod,
      SwabTest,
      SwabEnvironment
    ]),
    FacilityModule
  ],
  controllers: [
    SwabController,
    SwabAreaController,
    SwabAreaHistoryController,
    SwabPeriodController
  ],
  providers: [
    SwabService,
    SwabAreaService,
    SwabAreaHistoryService,
    SwabPeriodService,
    SwabAreaExistsRule,
    SwabPeriodExistsRule,
    SwabAreaHistoryExistsRule,
    SwabEnvironmentExistsRule,
    SwabAreaHistoryImageExistsRule
  ]
})
export class SwabModule { }
