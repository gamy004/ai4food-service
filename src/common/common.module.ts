import { Module } from '@nestjs/common';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileExistsRule } from './validators/file-exists-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([File])
  ],

  controllers: [FileController],

  providers: [
    FileService,
    FileExistsRule
  ],

  exports: [
    FileService,
    FileExistsRule
  ]
})
export class CommonModule { }
