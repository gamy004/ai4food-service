import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabArea } from '../entities/swab-area.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { FindOptionsRelations, IsNull } from 'typeorm';
import { FindAllSwabAreaQuery } from '../dto/find-all-swab-area-query.dto';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import { BodyUpdateSwabAreaDto, ParamUpdateSwabAreaDto } from '../dto/update-swab-area.dto';

@Injectable()
export class SwabAreaService extends CrudService<SwabArea> {
  constructor(
    @InjectRepository(SwabArea)
    repository: CommonRepositoryInterface<SwabArea>,
  ) {
    super(repository);
  }

  findAllMainArea(dto: FindAllSwabAreaQuery): Promise<SwabArea[]> {
    const { subSwabAreas = false, facility = false } = dto;

    const relations: FindOptionsRelations<SwabArea> = {
      subSwabAreas,
      facility,
    };

    return this.repository.find({
      where: {
        mainSwabAreaId: IsNull(),
      },
      relations,
      select: {
        id: true,
        swabAreaName: true,
        facilityId: true,
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

  async updateSwabArea(
    param: ParamUpdateSwabAreaDto,
    body: BodyUpdateSwabAreaDto,
  ): Promise<SwabArea> {

    const {
      swabAreaName = '',
      subSwabAreas: insertedSubSwabAreas = [],
      facility,
    } = body;

    const swabArea = await this.repository.findOneByOrFail(param);

    if (swabAreaName) {
      swabArea.swabAreaName = swabAreaName;
    }

    if (facility) {
      swabArea.facility = facility;
    }

    const subSwabAreas = insertedSubSwabAreas.map((insertedSubSwabArea) => {
      let subSwabArea;
      if (insertedSubSwabArea.id) {
        subSwabArea = this.repository.create({
          id: insertedSubSwabArea.id,
          swabAreaName: insertedSubSwabArea.swabAreaName,
          facility,
        })
      } else {
        subSwabArea = this.repository.create({
          swabAreaName: insertedSubSwabArea.swabAreaName,
          facility,
        })
      }
      return subSwabArea
    });

    if (subSwabAreas.length) {
      swabArea.subSwabAreas = subSwabAreas;
    }

    const insertedMainSwabArea = await this.repository.save(swabArea);

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
