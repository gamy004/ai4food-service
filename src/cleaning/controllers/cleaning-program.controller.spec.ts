import { Test, TestingModule } from '@nestjs/testing';
import { CleaningProgramController } from './cleaning-program.controller';

describe('CleaningProgramController', () => {
  let controller: CleaningProgramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleaningProgramController],
    }).compile();

    controller = module.get<CleaningProgramController>(
      CleaningProgramController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
