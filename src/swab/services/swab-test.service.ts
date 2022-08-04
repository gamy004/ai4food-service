import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabTest } from '../entities/swab-test.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { BodyUpdateSwabTestDto, ParamUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';

@Injectable()
export class SwabTestService extends CrudService<SwabTest> {
  constructor(
    @InjectRepository(SwabTest)
    repository: CommonRepositoryInterface<SwabTest>
  ) {
    super(repository);
  }

  async commandUpdateBacteria(id: number, bodycommandUpdateSwabTestDto: BodyUpdateSwabTestDto): Promise<void> {

  }
}
