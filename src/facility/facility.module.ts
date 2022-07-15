import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilityItem } from './entities/facility-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Facility,
      FacilityItem
    ])
  ],
  controllers: [FacilityController],
  providers: [FacilityService]
})
export class FacilityModule { }
