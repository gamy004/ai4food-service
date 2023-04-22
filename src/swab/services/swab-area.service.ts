import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabArea } from '../entities/swab-area.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
} from 'typeorm';
import { FindAllSwabAreaQuery } from '../dto/find-all-swab-area-query.dto';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import {
  BodyUpdateSwabAreaDto,
  ParamUpdateSwabAreaDto,
} from '../dto/update-swab-area.dto';
import {
  ParamGetSwabAreaDeletePermissionDto,
  ResponseGetSwabAreaDeletePermissionDto,
} from '../dto/get-swab-area-delete-permission.dto';
import { ContactZoneService } from '~/facility/services/contact-zone.service';

@Injectable()
export class SwabAreaService extends CrudService<SwabArea> {
  constructor(
    private readonly contactZoneService: ContactZoneService,
    @InjectRepository(SwabArea)
    repository: CommonRepositoryInterface<SwabArea>,
  ) {
    super(repository);
  }

  findAllMainArea(dto: FindAllSwabAreaQuery): Promise<SwabArea[]> {
    const { subSwabAreas = false, facility = false, contactZone = false } = dto;

    const relations: FindOptionsRelations<SwabArea> = {
      subSwabAreas:
        subSwabAreas && contactZone ? { contactZone } : subSwabAreas,
      facility,
      contactZone,
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
        contactZone: {
          id: true,
          contactZoneName: true,
          contactZoneDescription: true,
        },
      },
      order: {
        createdAt: 'asc',
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
      contactZone = null,
    } = createSwabAreaDto;

    const mainSwabArea = this.repository.create({
      swabAreaName,
      facility,
      contactZone,
    });

    const subSwabAreas = insertedSubSwabAreas.map((insertedSubSwabArea) =>
      this.repository.create({
        swabAreaName: insertedSubSwabArea.swabAreaName,
        facility,
        contactZone: insertedSubSwabArea.contactZone || null,
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
        subSwabAreas: {
          contactZone: true,
        },
        facility: true,
        contactZone: true,
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
      contactZone = null,
    } = body;

    const swabArea = await this.repository.findOneByOrFail(param);

    if (swabAreaName) {
      swabArea.swabAreaName = swabAreaName;
    }

    if (contactZone) {
      swabArea.contactZone = this.contactZoneService.make(contactZone);
    } else {
      swabArea.contactZone = null;
    }

    if (facility) {
      swabArea.facility = facility;
    }
    const currentSubSwabAreaIds = [];

    const subSwabAreas = insertedSubSwabAreas.map((insertedSubSwabArea) => {
      let subSwabArea;

      if (insertedSubSwabArea.id) {
        currentSubSwabAreaIds.push(insertedSubSwabArea.id);

        subSwabArea = this.repository.create({
          id: insertedSubSwabArea.id,
          swabAreaName: insertedSubSwabArea.swabAreaName,
          facility,
          contactZone: insertedSubSwabArea.contactZone || null,
        });
      } else {
        subSwabArea = this.repository.create({
          swabAreaName: insertedSubSwabArea.swabAreaName,
          facility,
          contactZone: insertedSubSwabArea.contactZone || null,
        });
      }
      return subSwabArea;
    });

    // Need to validate with swab area history that can delete only!
    const removeSubSwabAreaCondition: FindOptionsWhere<SwabArea> = {
      mainSwabAreaId: swabArea.id,
    };

    if (currentSubSwabAreaIds.length) {
      removeSubSwabAreaCondition.id = Not(
        In([...new Set(currentSubSwabAreaIds)]),
      );
    }

    const deletedSubSwabAreas = await this.repository.find({
      where: removeSubSwabAreaCondition,
      // relations: { // Need to think first!
      // },
    });

    if (deletedSubSwabAreas.length) {
      await this.repository.softRemove(deletedSubSwabAreas);
    }

    if (subSwabAreas.length) {
      swabArea.subSwabAreas = subSwabAreas;
    }

    const insertedMainSwabArea = await this.repository.save(swabArea);

    return await this.repository.findOne({
      where: {
        id: insertedMainSwabArea.id,
      },
      relations: {
        subSwabAreas: {
          contactZone: true,
        },
        facility: true,
        contactZone: true,
      },
    });
  }

  async getDeletePermission(
    param: ParamGetSwabAreaDeletePermissionDto,
  ): Promise<ResponseGetSwabAreaDeletePermissionDto> {
    let canDelete = true;
    let message = '';

    const swabAreaWithRelations = await this.repository.findOneOrFail({
      where: { id: param.id },
      relations: {
        swabAreaHistories: true,
      },
      select: {
        id: true,
        swabAreaHistories: {
          id: true,
        },
      },
    });

    const { swabAreaHistories = [] } = swabAreaWithRelations;

    const countSwabAreaHistories = swabAreaHistories.length;

    const hasRelations = countSwabAreaHistories > 0;

    if (hasRelations) {
      canDelete = false;
      message = 'Cannot delete, entity has related data.';
    }

    return {
      canDelete,
      message,
      countSwabAreaHistories,
    };
  }
}
