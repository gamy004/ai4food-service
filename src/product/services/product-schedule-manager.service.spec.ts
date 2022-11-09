import { Test, TestingModule } from '@nestjs/testing';
import { ProductScheduleManagerService } from './product-schedule-manager.service';

describe('ProductScheduleManagerService', () => {
  let service: ProductScheduleManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductScheduleManagerService],
    }).compile();

    service = module.get<ProductScheduleManagerService>(
      ProductScheduleManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
