import { Test, TestingModule } from '@nestjs/testing';
import { SwabCleaningValidationController } from './swab-cleaning-validation.controller';
import { SwabCleaningValidationService } from '../services/swab-cleaning-validation.service';

describe('SwabCleaningValidationController', () => {
  let controller: SwabCleaningValidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabCleaningValidationController],
      providers: [SwabCleaningValidationService],
    }).compile();

    controller = module.get<SwabCleaningValidationController>(
      SwabCleaningValidationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
