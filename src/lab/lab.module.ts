import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BacteriaSpecieController } from './controllers/bacteria-specie.controller';
import { BacteriaController } from './controllers/bacteria.controller';
import { BacteriaSpecie } from './entities/bacteria-specie.entity';
import { Bacteria } from './entities/bacteria.entity';
import { BacteriaSpecieService } from './services/bacteria-specie.service';
import { BacteriaService } from './services/bacteria.service';
import { BacteriaExistsRule } from './validators/bacteria-exists-validator';
import { BacteriaSpecieExistsRule } from './validators/bacteria-specie-exists-validator';

@Module({
  imports: [TypeOrmModule.forFeature([Bacteria, BacteriaSpecie])],
  controllers: [BacteriaController, BacteriaSpecieController],
  providers: [
    BacteriaService,
    BacteriaSpecieService,
    BacteriaExistsRule,
    BacteriaSpecieExistsRule,
  ],
  exports: [BacteriaService, BacteriaSpecieService],
})
export class LabModule {}
