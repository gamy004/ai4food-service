import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilityItem } from './entities/facility-item.entity';
import { Room } from './entities/room.entity';
import { Zone } from './entities/zone.entity';
import { FacilityItemService } from './facility-item.service';
import { FacilityItemExistsRule } from './validators/facility-item-exists-validator';

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
  providers: [FacilityService, FacilityItemService, FacilityItemExistsRule],
  exports: [FacilityService, FacilityItemService, FacilityItemExistsRule]
})
export class FacilityModule { }
