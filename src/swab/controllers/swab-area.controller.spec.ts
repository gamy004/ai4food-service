import { Test, TestingModule } from '@nestjs/testing';
import { SwabAreaService } from '../services/swab-area.service';
import { SwabAreaController } from './swab-area.controller';

describe('SwabAreaController', () => {
  let controller: SwabAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwabAreaController],
      providers: [SwabAreaService],
    }).compile();

    controller = module.get<SwabAreaController>(SwabAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
