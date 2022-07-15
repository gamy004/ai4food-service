import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilityItem } from './entities/facility-item.entity';
import { Room } from './entities/room.entity';
import { Zone } from './entities/zone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Zone,
      Room,
      Facility,
      FacilityItem
    ])
  ],
  controllers: [FacilityController],
  providers: [FacilityService]
})
export class FacilityModule { }
