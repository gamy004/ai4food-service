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
import { SwabRoundService } from './services/swab-round.service';
import { SwabRound } from './entities/swab-round.entity';
import { SwabProductQueryService } from './services/swab-product-query.service';
import { SwabProductManagerService } from './services/swab-product-manager.service';
import { SwabProductHistoryController } from './controllers/swab-product-history.controller';
import { SwabProductHistoryService } from './services/swab-product-history.service';
import { SwabLabManagerService } from './services/swab-lab-manager.service';
import { SwabProductHistoryExistsRule } from './validators/swab-product-history-exists-validator';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { SwabAreaHistoryRelationManagerService } from './services/swab-area-history-relation-manager.service';
import { ImportTransactionModule } from '~/import-transaction/import-transaction.module';
import { SwabTestImporter } from './services/swab-test.importer';
import { CleaningModule } from '~/cleaning/cleaning.module';
import { CleaningHistory } from '~/cleaning/entities/cleaning-history.entity';
import { CleaningProgram } from '~/cleaning/entities/cleaning-program.entity';
import { CleaningHistoryCleaningValidation } from '~/cleaning/entities/cleaning-history-cleaning-validation.entity';
import { SwabCleaningValidation } from './entities/swab-cleaning-validation.entity';
import { SwabCleaningValidationController } from './controllers/swab-cleaning-validation.controller';
import { SwabCleaningValidationService } from './services/swab-cleaning-validation.service';
import { SwabCleaningValidationQueryService } from './services/swab-cleaning-validation-query.service';
import { SwabCleaningValidationSeedService } from './services/swab-cleaning-validation-seed.service';
import { SwabTestQueryService } from './services/swab-test-query.service';
import { SwabSampleType } from './entities/swab-sample-type.entity';
import { SwabSampleTypeService } from './services/swab-sample-type.service';
import { SwabSampleTypeSeedService } from './services/swab-sample-type-seed.service';
import { SwabSampleTypeController } from './controllers/swab-sample-type.controller';
import { SwabSampleTypeExistsRule } from './validators/swab-sample-type-exists-validator';
import { SwabPlanController } from './controllers/swab-plan.controller';
import { SwabPlannerService } from './services/swab-planner.service';
import { SwabPlanCrudService } from './services/swab-plan-crud.service';
import { SwabPlan } from './entities/swab-plan.entity';
import { SwabPlanExistsRule } from './validators/swab-plan-exists-validator';
import { SwabPlanItem } from './entities/swab-plan-item.entity';
import { SwabPlanItemCrudService } from './services/swab-plan-item-crud.service';
import { SwabPlanItemController } from './controllers/swab-plan-item.controller';
import { SwabPlanItemExistsRule } from './validators/swab-plan-item-exists-validator';

@Module({
  imports: [
    ImportTransactionModule,
    TypeOrmModule.forFeature([
      SwabAreaHistory,
      SwabAreaHistoryImage,
      SwabArea,
      SwabPeriod,
      SwabTest,
      SwabEnvironment,
      SwabProductHistory,
      SwabRound,
      FacilityItem,
      CleaningHistory,
      CleaningProgram,
      CleaningHistoryCleaningValidation,
      SwabCleaningValidation,
      SwabSampleType,
      SwabPlan,
      SwabPlanItem,
    ]),
    FacilityModule,
    ProductModule,
    LabModule,
    CommonModule,
    CleaningModule,
  ],
  controllers: [
    SwabController,
    SwabAreaController,
    SwabAreaHistoryController,
    SwabPeriodController,
    SwabEnvironmentController,
    SwabTestController,
    SwabProductHistoryController,
    SwabCleaningValidationController,
    SwabSampleTypeController,
    SwabPlanController,
    SwabPlanItemController,
  ],
  providers: [
    SwabPlanQueryService,
    SwabPlanManagerService,
    SwabLabQueryService,
    SwabLabManagerService,
    SwabAreaService,
    SwabAreaHistoryService,
    SwabAreaHistoryImageService,
    SwabAreaHistoryRelationManagerService,
    SwabPeriodService,
    SwabEnvironmentService,
    SwabTestService,
    SwabTestQueryService,
    SwabRoundService,
    SwabAreaExistsRule,
    SwabPeriodExistsRule,
    SwabAreaHistoryExistsRule,
    SwabEnvironmentExistsRule,
    SwabAreaHistoryImageExistsRule,
    SwabProductHistoryExistsRule,
    SwabTestExistsRule,
    SwabProductQueryService,
    SwabProductHistoryService,
    SwabProductManagerService,
    {
      provide: 'DataCollectorImporterInterface<SwabTest>',
      useClass: SwabTestImporter,
    },
    SwabCleaningValidationService,
    SwabCleaningValidationQueryService,
    SwabCleaningValidationSeedService,
    SwabSampleTypeService,
    SwabSampleTypeSeedService,
    SwabSampleTypeExistsRule,
    SwabPlanCrudService,
    SwabPlannerService,
    SwabPlanExistsRule,
    SwabPlanItemCrudService,
    SwabPlanItemExistsRule,
  ],
})
export class SwabModule {}
