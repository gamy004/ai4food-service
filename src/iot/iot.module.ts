import { Module } from '@nestjs/common';
import { SensorDataService } from './services/sensor-data.service';
// import { SensorDataController } from './controllers/sensor-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorData } from './entities/sensor-data.entity';
import { SensorMapping } from './entities/sensor-mapping.entity';
import { SensorMappingService } from './services/sensor-mapping.service';

@Module({
  imports: [TypeOrmModule.forFeature([SensorData, SensorMapping])],
  controllers: [
    // SensorDataController
  ],
  providers: [SensorDataService, SensorMappingService],
  exports: [SensorDataService, SensorMappingService],
})
export class IotModule {}
