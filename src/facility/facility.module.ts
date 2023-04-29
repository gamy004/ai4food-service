import { Module } from '@nestjs/common';
import { FacilityService } from './services/facility.service';
import { FacilityController } from './controllers/facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilityItem } from './entities/facility-item.entity';
import { Room } from './entities/room.entity';
import { Zone } from './entities/zone.entity';
import { FacilityItemService } from './services/facility-item.service';
import { FacilityItemExistsRule } from './validators/facility-item-exists-validator';
import { FacilityExistsRule } from './validators/facility-exists-validator';
import { RoomController } from './controllers/room.controller';
import { RoomService } from './services/room.service';
import { RoomExistsRule } from './validators/room-exists-validator';
import { ZoneExistsRule } from './validators/zone-exists-validator';
import { RiskZoneExistsRule } from './validators/risk-zone-exists-validator';
import { RiskZone } from './entities/risk-zone.entity';
import { ContactZone } from './entities/contact-zone.entity';
import { ContactZoneController } from './controllers/contact-zone.controller';
import { ContactZoneService } from './services/contact-zone.service';
import { ContactZoneExistsRule } from './validators/contact-zone-exists-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Zone,
      RiskZone,
      Room,
      Facility,
      FacilityItem,
      ContactZone,
    ]),
  ],
  controllers: [FacilityController, RoomController, ContactZoneController],
  providers: [
    FacilityService,
    FacilityItemService,
    RoomService,
    ContactZoneService,
    FacilityExistsRule,
    FacilityItemExistsRule,
    RoomExistsRule,
    ZoneExistsRule,
    RiskZoneExistsRule,
    ContactZoneExistsRule,
  ],
  exports: [
    FacilityService,
    FacilityItemService,
    RoomService,
    ContactZoneService,
    FacilityExistsRule,
    FacilityItemExistsRule,
    RoomExistsRule,
    ZoneExistsRule,
    RiskZoneExistsRule,
    ContactZoneExistsRule,
  ],
})
export class FacilityModule {}
