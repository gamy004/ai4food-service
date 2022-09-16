import { Test, TestingModule } from '@nestjs/testing';
import { BacteriaSpecieService } from '../services/bacteria-specie.service';
import { BacteriaSpecieController } from './bacteria-specie.controller';

describe('BacteriaSpecieController', () => {
  let controller: BacteriaSpecieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacteriaSpecieController],
      providers: [BacteriaSpecieService],
    }).compile();

    controller = module.get<BacteriaSpecieController>(BacteriaSpecieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
