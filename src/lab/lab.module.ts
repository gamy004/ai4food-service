import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BacteriaService } from './bacteria.service';
import { Bacteria } from './entities/bacteria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bacteria
    ])
  ],
  controllers: [],
  providers: [BacteriaService],
})
export class LabModule { }
