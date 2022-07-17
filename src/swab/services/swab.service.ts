import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { CreateSwabDto } from '../dto/create-swab.dto';
import { UpdateSwabDto } from '../dto/update-swab.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabTest } from '../entities/swab-test.entity';
import { SwabPeriodService } from './swab-period.service'
import { SwabAreaService } from './swab-area.service'

@Injectable()
export class SwabService {
  constructor(
    @InjectRepository(FacilityItem)
    private swabPeriodService: SwabPeriodService,
    private swabAreaService: SwabAreaService,

  ) { }

  create(createSwabDto: CreateSwabDto) {
    return 'This action adds a new swab';
  }

  findAll() {
    return `This action returns all swab`;
  }

  findOne(id: number) {
    return `This action returns a #${id} swab`;
  }

  async generateSwabPlan() {

    const bigCleaningSwabPeriods = await this.swabPeriodService.find([
      { swabPeriodName: "ก่อน Super Big Cleaning", deletedAt: null },
      { swabPeriodName: "หลัง Super Big Cleaning", deletedAt: null },
    ]);

    const generalSwabPeriods = await this.swabPeriodService.find([
      { swabPeriodName: "หลังประกอบเครื่อง", deletedAt: null },
      { swabPeriodName: "ก่อนล้างระหว่างงาน", deletedAt: null },
      { swabPeriodName: "หลังล้างระหว่างงาน", deletedAt: null },
      { swabPeriodName: "เดินไลน์หลังพัก 4 ชม.", deletedAt: null },
      { swabPeriodName: "ก่อนล้างท้ายกะ", deletedAt: null },
      { swabPeriodName: "หลังล้างท้ายกะ", deletedAt: null },
    ]);

    const swabAreas = await this.swabAreaService.findAll({
      relations: ['mainSwabArea', 'mainSwabArea.subSwabAreas']
    });

    const swabAreaHistories = [];
    for (let index = 0; index < swabAreas.length; index++) {

      const NUMBER_OF_HISTORY_DAY = 1;

      async function generateSwabAreaHistory(swabArea, numOfDate = 1,) {
        for (let subIndex = 0; subIndex < numOfDate; subIndex++) {
          const currentDate = new Date();

          currentDate.setDate(currentDate.getDate() + subIndex);

          let createdSwabPeriods = [
            ...generalSwabPeriods
          ];

          if (subIndex === 0) {
            createdSwabPeriods = [
              ...createdSwabPeriods,
              ...bigCleaningSwabPeriods
            ]
          };

          for (let subIndex2 = 0; subIndex2 < createdSwabPeriods.length; subIndex2++) {
            const swabPeriod = createdSwabPeriods[subIndex2];

            const swabTest = SwabTest.create({
              listeriaMonoDetected: null,
              listeriaMonoValue: null
            });

            const swabAreaHistory = SwabAreaHistory.create({
              swabAreaDate: currentDate,
              swabAreaSwabedAt: null,
              swabPeriod,
              swabTest,
              swabArea
            });

            swabAreaHistories.push(swabAreaHistory);
          }
        }
      }

      for (let index2 = 0; index2 < swabAreas.length; index2++) {
        const { mainSwabArea } = swabAreas[index2];

        if (mainSwabArea) {
          const { subSwabAreas = [] } = mainSwabArea;

          if (subSwabAreas.length) {
            for (let index3 = 0; index3 < subSwabAreas.length; index3++) {
              const subSwabArea = subSwabAreas[index3];
              await generateSwabAreaHistory(subSwabArea, NUMBER_OF_HISTORY_DAY);
            }
          }
        } else {
          await generateSwabAreaHistory(swabAreas[index2], NUMBER_OF_HISTORY_DAY);
        }

      }
    }

    return swabAreas

  }

  update(id: number, updateSwabDto: UpdateSwabDto) {
    return `This action updates a #${id} swab`;
  }

  remove(id: number) {
    return `This action removes a #${id} swab`;
  }
}
