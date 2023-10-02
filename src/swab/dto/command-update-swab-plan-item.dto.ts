import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, Validate, ValidateIf, ValidateNested } from 'class-validator';
import { PayloadAddSwabPlanItemDto } from './command-add-swab-plan-item.dto';
import { SwabPlanItemExistsRule } from '../validators/swab-plan-item-exists-validator';
import { RelationField } from '~/common/validators/relation-field-validator';
import { SwabArea } from '../entities/swab-area.entity';
import { FindOptionsWhere, IsNull } from 'typeorm';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { SwabPlanExistsRule } from '../validators/swab-plan-exists-validator';

export class ParamCommandUpdateSwabPlanItemDto {
  @IsUUID()
  @Validate(SwabPlanExistsRule)
  swabPlanId: string;

  @IsUUID()
  @Validate(SwabPlanItemExistsRule)
  swabPlanItemId: string;
}

export class PayloadUpdateSwabPlanItemDto extends PickType(
  PayloadAddSwabPlanItemDto,
  ['swabArea', 'facilityItem'],
) {}

export class BodyCommandUpdateSwabPlanItemDto {
  @ValidateNested()
  @Type(() => PayloadUpdateSwabPlanItemDto)
  @ValidateIf(({ payload }) => !!payload.facilityItem?.id)
  @Validate(RelationField, [
    {
      entity: SwabArea,
      condition: ({ object: { payload } }: { object: any }) => {
        const constraints: FindOptionsWhere<SwabArea> = {
          id: payload.swabArea.id,
          deletedAt: IsNull(),
        };

        return constraints;
      },
    },
    {
      entity: FacilityItem,
      condition: ({ object: { payload } }: { object: any }) => {
        const constraints: FindOptionsWhere<FacilityItem> = {
          id: payload.facilityItem?.id,
          deletedAt: IsNull(),
        };

        return constraints;
      },
    },
    ['facilityId'],
  ])
  payload!: PayloadUpdateSwabPlanItemDto;
}
