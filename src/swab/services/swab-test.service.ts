import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabTest } from '../entities/swab-test.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { BodyUpdateSwabTestDto, ParamUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';

@Injectable()
export class SwabTestService {
  constructor(
    @InjectRepository(SwabTest)
    protected readonly swabTestRepository: Repository<SwabTest>,

  ) {}
  async commandUpdateSwabPlanById(id: string, bodycommandUpdateSwabTestDto: BodyUpdateSwabTestDto): Promise<void> {
    const {
      listeriaMonoDetected
    } = bodycommandUpdateSwabTestDto;
    console.log(listeriaMonoDetected)
    const swabTest = await this.swabTestRepository.findOneBy({ id });
    if(listeriaMonoDetected){
      swabTest.listeriaMonoDetected = listeriaMonoDetected
    }
    this.swabTestRepository.save(swabTest)
    

}
}
