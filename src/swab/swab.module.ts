import { Module } from '@nestjs/common';
import { SwabService } from './swab.service';
import { SwabController } from './swab.controller';

@Module({
  controllers: [SwabController],
  providers: [SwabService]
})
export class SwabModule {}
