import { Test, TestingModule } from '@nestjs/testing';
import { SwabController } from './swab.controller';
import { SwabService } from './swab.service';

describe('SwabController', () => {
  let controller: SwabController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabController],
      providers: [SwabService],
    }).compile();

    controller = module.get<SwabController>(SwabController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
