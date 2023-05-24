import { Test, TestingModule } from '@nestjs/testing';
import { SwabSampleTypeService } from '../services/swab-sample-type.service';
import { SwabSampleTypeController } from './swab-sample-type.controller';

describe('SwabSampleTypeController', () => {
  let controller: SwabSampleTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabSampleTypeController],
      providers: [SwabSampleTypeService],
    }).compile();

    controller = module.get<SwabSampleTypeController>(SwabSampleTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
