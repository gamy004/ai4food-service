import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';
import { UpdateRelatedSwabAreaHistoryDto } from '../dto/update-related-swab-area-history.dto';
import { SwabAreaHistory } from '../entities/swab-area-history.entity';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabAreaHistoryService } from './swab-area-history.service';
import { SwabAreaService } from './swab-area.service';
import { SwabRoundService } from './swab-round.service';

@Injectable()
export class SwabAreaHistoryRelationManagerService {
  constructor(
    private readonly swabRoundService: SwabRoundService,
    private readonly swabAreaService: SwabAreaService,
    private readonly swabAreaHistoryService: SwabAreaHistoryService,
  ) {}

  async updateRelatedSwabAreaHistory(
    dto: UpdateRelatedSwabAreaHistoryDto,
    transaction = false,
  ) {
    const { roundNumberSwabTest = '' } = dto;

    const where: FindOptionsWhere<SwabAreaHistory> =
      this.swabAreaHistoryService.toFilter(dto);

    if (roundNumberSwabTest) {
      const swabRound = await this.swabRoundService.findOneOrFail({
        where: { swabRoundNumber: roundNumberSwabTest },
        transaction,
      });

      if (swabRound) {
        where.swabRoundId = swabRound.id;
      }
    }

    const swabAreaHistories = await this.swabAreaHistoryService.find({
      where,
      transaction,
    });

    const mainSwabAreaMap: Record<string, SwabArea> = {};
    const subSwabAreaMap: Record<string, SwabArea> = {};
    const mainSwabAreaRelationMap: Record<string, string> = {};
    const mainSwabAreaHistoryMap: Record<string, SwabAreaHistory> = {};
    const groupedSwabAreaHistories: Record<string, SwabAreaHistory[]> = {};

    const updatedSubSwabAreaHistories: SwabAreaHistory[] = [];

    if (swabAreaHistories.length) {
      console.log(
        `found swab area hsitories ${swabAreaHistories.length} records`,
      );

      const swabAreaIds = [
        ...new Set(
          swabAreaHistories.map(({ swabAreaId }) => swabAreaId).filter(Boolean),
        ),
      ];

      if (swabAreaIds.length) {
        const swabAreas = await this.swabAreaService.find({
          where: { id: In(swabAreaIds) },
        });

        swabAreas.forEach((swabArea) => {
          if (swabArea.mainSwabAreaId) {
            subSwabAreaMap[swabArea.id] = swabArea;
            mainSwabAreaRelationMap[swabArea.id] = swabArea.mainSwabAreaId;
          } else {
            mainSwabAreaMap[swabArea.id] = swabArea;
          }
        });
      }

      console.log(
        `found swab area hsitories ${swabAreaHistories.length} records`,
      );

      swabAreaHistories.forEach((swabAreaHistory) => {
        const isSubSwabArea = subSwabAreaMap[swabAreaHistory.swabAreaId];

        if (isSubSwabArea) {
          const mainSwabAreaId =
            mainSwabAreaRelationMap[swabAreaHistory.swabAreaId];

          if (mainSwabAreaId) {
            const swabAreaHistoryGroupKey = `${swabAreaHistory.swabAreaDate}_${swabAreaHistory.shift}_${swabAreaHistory.swabPeriodId}_${mainSwabAreaId}`;

            if (!groupedSwabAreaHistories[swabAreaHistoryGroupKey]) {
              groupedSwabAreaHistories[swabAreaHistoryGroupKey] = [];
            }

            groupedSwabAreaHistories[swabAreaHistoryGroupKey].push(
              swabAreaHistory,
            );
          }
        } else {
          const swabAreaHistoryGroupKey = `${swabAreaHistory.swabAreaDate}_${swabAreaHistory.shift}_${swabAreaHistory.swabPeriodId}_${swabAreaHistory.swabAreaId}`;

          mainSwabAreaHistoryMap[swabAreaHistoryGroupKey] = swabAreaHistory;
        }
      });

      Object.keys(groupedSwabAreaHistories).forEach((key) => {
        const mainSwabAreaHistory = mainSwabAreaHistoryMap[key];

        if (mainSwabAreaHistory) {
          groupedSwabAreaHistories[key] = groupedSwabAreaHistories[key].map(
            (subSwabAreaHistory) => {
              subSwabAreaHistory.mainSwabAreaHistoryId = mainSwabAreaHistory.id;

              return subSwabAreaHistory;
            },
          );
        }
      });

      Object.values(groupedSwabAreaHistories).forEach(
        (subSwabAreaHistories) => {
          subSwabAreaHistories.forEach((subSwabAreaHistory) =>
            updatedSubSwabAreaHistories.push(subSwabAreaHistory),
          );
        },
      );
    }

    return {
      updatedSubSwabAreaHistories,
    };
  }
}
