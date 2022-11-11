import { Test, TestingModule } from '@nestjs/testing';
import { ProductScheduleService } from '../services/product-schedule.service';
import { ProductScheduleController } from './product-schedule.controller';

describe('ProductScheduleController', () => {
  let controller: ProductScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductScheduleController],
      providers: [ProductScheduleService],
    }).compile();

    controller = module.get<ProductScheduleController>(
      ProductScheduleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeUndefined();
  });
});
