import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlanCrudService } from './swab-plan-crud.service';

describe('SwabPlanCrudService', () => {
  let service: SwabPlanCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabPlanCrudService],
    }).compile();

    service = module.get<SwabPlanCrudService>(SwabPlanCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
