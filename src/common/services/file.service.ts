import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from '../entities/file.entity';
import { CommonRepositoryInterface } from '../interface/common.repository.interface';
import { CrudService } from './abstract.crud.service';

@Injectable()
export class FileService extends CrudService<File> {
  constructor(
    @InjectRepository(File)
    repository: CommonRepositoryInterface<File>
  ) {
    super(repository);
  }
}
