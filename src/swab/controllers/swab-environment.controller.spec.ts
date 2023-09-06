import { Test, TestingModule } from '@nestjs/testing';
import { SwabEnvironmentService } from '../services/swab-environment.service';
import { SwabEnvironmentController } from './swab-environment.controller';

describe('SwabEnvironmentController', () => {
  let controller: SwabEnvironmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabEnvironmentController],
      providers: [SwabEnvironmentService],
    }).compile();

    controller = module.get<SwabEnvironmentController>(
      SwabEnvironmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
