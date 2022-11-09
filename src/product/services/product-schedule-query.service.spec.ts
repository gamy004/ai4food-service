import { Test, TestingModule } from '@nestjs/testing';
import { ProductScheduleQueryService } from './product-schedule-query.service';

describe('ProductScheduleQueryService', () => {
  let service: ProductScheduleQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductScheduleQueryService],
    }).compile();

    service = module.get<ProductScheduleQueryService>(
      ProductScheduleQueryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
