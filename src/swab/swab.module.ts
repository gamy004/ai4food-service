import { Module } from '@nestjs/common';
import { SwabService } from './services/swab.service';
import { SwabController } from './controllers/swab.controller';
import { SwabAreaHistoryController } from './controllers/swab-area-history.controller';
import { SwabAreaHistoryService } from './services/swab-area-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwabAreaHistory } from './entities/swab-area-history.entity';
import { SwabAreaImage } from './entities/swab-area-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SwabAreaHistory, SwabAreaImage])
  ],
  controllers: [SwabController, SwabAreaHistoryController],
  providers: [SwabService, SwabAreaHistoryService]
})
export class SwabModule { }
