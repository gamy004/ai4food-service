import { Test, TestingModule } from '@nestjs/testing';
import { SwabPlannerService } from './swab-planner.service';
import { BodyCommandCreateDraftSwabPlanDto } from '../dto/command-create-draft-swab-plan.dto';
import { SwabPlan } from '../entities/swab-plan.entity';
import { SwabPlanCrudService } from './swab-plan-crud.service';
import { DeepPartial } from 'typeorm';

describe('SwabPlannerService', () => {
  let service: SwabPlannerService;
  let crudService: SwabPlanCrudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwabPlannerService, SwabPlanCrudService],
    }).compile();

    service = module.get<SwabPlannerService>(SwabPlannerService);
    crudService = module.get<SwabPlanCrudService>(SwabPlanCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create draft swab plan', async () => {
    const dto: BodyCommandCreateDraftSwabPlanDto = {
      swabPlanDate: '2023-07-09',
      swabPeriod: {
        id: '999',
      },
    };

    jest
      .spyOn(crudService, 'create')
      .mockImplementation((dto: DeepPartial<SwabPlan>) =>
        Promise.resolve(
          crudService.make({
            swabPlanDate: dto.swabPlanDate,
            swabPeriodId: dto.swabPeriod.id,
          }),
        ),
      );

    const createSwabPlan = service.commandCreateDraftSwabPlan(dto);

    expect(createSwabPlan).toBeInstanceOf(SwabPlan);
    expect(createSwabPlan).toMatchObject({
      swabPlanDate: dto.swabPlanDate,
      swabPeriodId: dto.swabPeriod.id,
      totalItems: 0,
      publish: false,
    });
  });
});
