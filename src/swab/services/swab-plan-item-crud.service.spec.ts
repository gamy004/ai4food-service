import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlanItemCrudService } from './swab-plan-item-crud.service';

describe('SwabPlanItemCrudService', () => {
  let service: SwabPlanItemCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabPlanItemCrudService],
    }).compile();

    service = module.get<SwabPlanItemCrudService>(SwabPlanItemCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
