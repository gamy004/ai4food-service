import { Module } from '@nestjs/common';
import { SwabService } from './services/swab.service';
import { SwabController } from './controllers/swab.controller';
import { SwabAreaHistoryController } from './controllers/swab-area-history.controller';
import { SwabAreaHistoryService } from './services/swab-area-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwabAreaHistory } from './entities/swab-area-history.entity';
import { SwabAreaImage } from './entities/swab-area-image.entity';
import { SwabPeriodController } from './controllers/swab-period.controller';
import { SwabPeriodService } from './services/swab-period.service';
import { SwabArea } from './entities/swab-area.entity';
import { SwabPeriod } from './entities/swab-period.entity';
import { SwabTest } from './entities/swab-test.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SwabAreaHistory, SwabAreaImage, SwabArea, SwabPeriod, SwabTest])
  ],
  controllers: [SwabController, SwabAreaHistoryController, SwabPeriodController],
  providers: [SwabService, SwabAreaHistoryService, SwabPeriodService]
})
export class SwabModule { }
