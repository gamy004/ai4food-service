import { Test, TestingModule } from '@nestjs/testing';
import { DataCollectorController } from './data-collector.controller';
import { DataCollectorService } from './data-collector.service';

describe('DataCollectorController', () => {
  let controller: DataCollectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataCollectorController],
      providers: [DataCollectorService],
    }).compile();

    controller = module.get<DataCollectorController>(DataCollectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
