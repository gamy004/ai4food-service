import { Test, TestingModule } from '@nestjs/testing';
import { ProductScheduleService } from './product-schedule.service';

describe('ProductScheduleService', () => {
  let service: ProductScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductScheduleService],
    }).compile();

    service = module.get<ProductScheduleService>(ProductScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
