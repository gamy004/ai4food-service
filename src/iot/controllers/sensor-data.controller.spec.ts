import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataService } from '../services/sensor-data.service';
import { SensorDataController } from './sensor-data.controller';

describe('SensorDataController', () => {
  let controller: SensorDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorDataController],
      providers: [SensorDataService],
    }).compile();

    controller = module.get<SensorDataController>(SensorDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
