import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BacteriaController } from './controllers/bacteria.controller';
import { Bacteria } from './entities/bacteria.entity';
import { BacteriaService } from './services/bacteria.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bacteria
    ])
  ],
  controllers: [
    BacteriaController
  ],
  providers: [BacteriaService],
})
export class LabModule { }
