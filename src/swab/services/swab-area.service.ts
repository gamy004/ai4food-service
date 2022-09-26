import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabArea } from '../entities/swab-area.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { IsNull } from 'typeorm';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';

@Injectable()
export class SwabAreaService extends CrudService<SwabArea> {
  constructor(
    @InjectRepository(SwabArea)
    repository: CommonRepositoryInterface<SwabArea>,
  ) {
    super(repository);
  }

  findAllMainArea(): Promise<SwabArea[]> {
    return this.repository.findBy({ mainSwabAreaId: IsNull() });
  }

  async createSwabArea(
    createSwabAreaDto: CreateSwabAreaDto,
  ): Promise<SwabArea> {
    const {
      swabAreaName = '',
      subSwabAreas: insertedSubSwabAreas = [],
      facility,
    } = createSwabAreaDto;

    const mainSwabArea = this.repository.create({ swabAreaName, facility });

    const subSwabAreas = insertedSubSwabAreas.map((insertedSubSwabArea) =>
      this.repository.create({
        swabAreaName: insertedSubSwabArea.swabAreaName,
        facility,
      }),
    );

    if (subSwabAreas.length) {
      mainSwabArea.subSwabAreas = subSwabAreas;
    }

    const insertedMainSwabArea = await this.repository.save(mainSwabArea);

    return await this.repository.findOne({
      where: {
        id: insertedMainSwabArea.id,
      },
      relations: {
        subSwabAreas: true,
        facility: true,
      },
      select: {
        id: true,
        swabAreaName: true,
        subSwabAreas: {
          id: true,
          swabAreaName: true,
          mainSwabAreaId: true,
        },
        facility: {
          id: true,
          facilityName: true,
          facilityType: true,
        },
      },
    });
  }
}
