import { Test, TestingModule } from '@nestjs/testing';
import { ProductScheduleController } from './product-schedule.controller';
import { ProductScheduleService } from './product-schedule.service';

describe('ProductScheduleController', () => {
  let controller: ProductScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductScheduleController],
      providers: [ProductScheduleService],
    }).compile();

    controller = module.get<ProductScheduleController>(ProductScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
