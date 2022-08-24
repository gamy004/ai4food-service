import { Controller } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { SensorDataService } from '../services/sensor-data.service';

@Controller()
export class SensorDataController {
  // constructor(private readonly sensorDataService: SensorDataService) { }

  // @MessagePattern('createSensorData')
  // create(@Payload() createSensorDataDto) {
  //   return this.sensorDataService.create(createSensorDataDto);
  // }

  // @MessagePattern('findAllSensorData')
  // findAll() {
  //   return this.sensorDataService.findAll();
  // }

  // @MessagePattern('findOneSensorData')
  // findOne(@Payload() id: number) {
  //   return this.sensorDataService.findOne(id);
  // }

  // @MessagePattern('updateSensorData')
  // update(@Payload() updateSensorDataDto) {
  //   return this.sensorDataService.update(updateSensorDataDto.id, updateSensorDataDto);
  // }

  // @MessagePattern('removeSensorData')
  // remove(@Payload() id: number) {
  //   return this.sensorDataService.remove(id);
  // }
}
