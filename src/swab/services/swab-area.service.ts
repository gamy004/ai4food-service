import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SwabArea } from '../entities/swab-area.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { IsNull, Not } from 'typeorm';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';

@Injectable()
export class SwabAreaService extends CrudService<SwabArea> {
  constructor(
    private readonly transaction: TransactionDatasource,
    @InjectRepository(SwabArea)
    repository: CommonRepositoryInterface<SwabArea>
  ) {
    super(repository)
  }

  findAllMainArea(): Promise<SwabArea[]> {
    return this.repository.findBy({ mainSwabAreaId: IsNull() });
  }

  async createSwabArea(createSwabAreaDto: CreateSwabAreaDto): Promise<SwabArea> {
    const { swabAreaName = "", subSwabAreas = [], facility } = createSwabAreaDto;

    let mainSwabAreaData;
    let swabAreaData;

    await this.transaction.execute(
      async (queryRunnerManger) => {
        const repository = queryRunnerManger.getRepository(SwabArea);

        const swabArea = await repository.findOne({ where: { swabAreaName: swabAreaName }, transaction: true });

        if (swabArea) throw new Error(`Main swab area name '${swabAreaName}' already exists, use other name to create data`);

        mainSwabAreaData = await repository.save({ swabAreaName, facility }, { transaction: true });

        if (mainSwabAreaData && subSwabAreas.length) {
          for (let index = 0; index < subSwabAreas.length; index++) {
            const element = subSwabAreas[index];

            const swabArea = await repository.findOne({ where: { swabAreaName: element.swabAreaName }, transaction: true });

            if (swabArea) throw new Error(`Sub swab area name '${element.swabAreaName}' already exists, use other name to create data`);

            await repository.save({ swabAreaName: element.swabAreaName, mainSwabArea: mainSwabAreaData, facility }, { transaction: true });
          }
        }
      })

    if (mainSwabAreaData) {
      swabAreaData = await this.repository.findOne({
        where: {
          id: mainSwabAreaData.id,
          subSwabAreas: Not(IsNull()),
          mainSwabArea: Not(IsNull()),
        },
        relations: {
          subSwabAreas: {
            mainSwabArea: true,
            facility: true
          },
          facility: true
        },
        select: {
          id: true,
          swabAreaName: true,
          subSwabAreas: {
            id: true,
            swabAreaName: true,
            mainSwabArea: {
              id: true,
              swabAreaName: true,
            },
            facility: {
              id: true,
              facilityName: true,
              facilityType: true,
            }
          },
          facility: {
            id: true,
            facilityName: true,
            facilityType: true,
          }
        }
      });
    }

    return swabAreaData
  }
}

