import { Test, TestingModule } from '@nestjs/testing';
import { BacteriaService } from '../services/bacteria.service';
import { BacteriaController } from './bacteria.controller';

describe('BacteriaController', () => {
  let controller: BacteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacteriaController],
      providers: [BacteriaService],
    }).compile();

    controller = module.get<BacteriaController>(BacteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
