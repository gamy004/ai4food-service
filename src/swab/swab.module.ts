import { Module } from '@nestjs/common';
import { SwabPlanQueryService } from './services/swab-plan-query.service';
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
import { SwabEnvironmentController } from './controllers/swab-environment.controller';
import { SwabEnvironmentService } from './services/swab-environment.service';
import { SwabPlanManagerService } from './services/swab-plan-manager.service';
import { ProductModule } from '~/product/product.module';
import { SwabProductHistory } from './entities/swab-product-history.entity';
import { SwabTestController } from './controllers/swab-test.controller';
import { SwabTestService } from './services/swab-test.service';
import { SwabTestExistsRule } from './validators/swab-test-exists-validator';
import { SwabAreaHistoryImageService } from './services/swab-area-history-image.service';
import { SwabLabQueryService } from './services/swab-lab-query.service';
import { CommonModule } from '~/common/common.module';
import { LabModule } from '~/lab/lab.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SwabAreaHistory,
      SwabAreaHistoryImage,
      SwabArea,
      SwabPeriod,
      SwabTest,
      SwabEnvironment,
      SwabProductHistory
    ]),
    FacilityModule,
    ProductModule,
    LabModule,
    CommonModule
  ],
  controllers: [
    SwabController,
    SwabAreaController,
    SwabAreaHistoryController,
    SwabPeriodController,
    SwabEnvironmentController,
    SwabTestController
  ],
  providers: [
    SwabPlanQueryService,
    SwabPlanManagerService,
    SwabLabQueryService,
    SwabAreaService,
    SwabAreaHistoryService,
    SwabAreaHistoryImageService,
    SwabPeriodService,
    SwabEnvironmentService,
    SwabTestService,
    SwabAreaExistsRule,
    SwabPeriodExistsRule,
    SwabAreaHistoryExistsRule,
    SwabEnvironmentExistsRule,
    SwabAreaHistoryImageExistsRule,
    SwabTestExistsRule
  ]
})
export class SwabModule { }
