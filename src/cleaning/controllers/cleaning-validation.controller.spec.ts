import { Test, TestingModule } from '@nestjs/testing';
import { CleaningValidationController } from './cleaning-validation.controller';

describe('CleaningValidationController', () => {
  let controller: CleaningValidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleaningValidationController],
    }).compile();

    controller = module.get<CleaningValidationController>(
      CleaningValidationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
