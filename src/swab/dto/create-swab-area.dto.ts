import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  Validate,
  //   IsUUID,
  //   Validate,
  ValidateNested,
} from 'class-validator';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { Unique } from '~/common/validators/unique-validator';
import { ConnectFacilityDto } from '~/facility/dto/connect-facility.dto';
import { SwabArea } from '../entities/swab-area.entity';
// import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';

export class CreateSwabAreaDto {
  //   @IsOptional()
  //   @IsUUID()
  //   @Validate(SwabAreaExistsRule)
  //   id?: string;

  @IsNotEmpty()
  @Validate(Unique, [
    SwabArea,
    ({
      object: { swabAreaName, facility },
    }: {
      object: Partial<SwabArea>;
    }) => ({
      swabAreaName,
      facilityId: facility.id,
      mainSwabAreaId: null,
      deletedAt: null,
    }),
  ])
  swabAreaName!: string;

  @IsOptional()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InsertSubSwabAreaDto)
  @Validate(UniqueFieldRecordRule, ['swabAreaName'])
  subSwabAreas?: InsertSubSwabAreaDto[];

  @ValidateNested()
  @Type(() => ConnectFacilityDto)
  facility!: ConnectFacilityDto;
}

export class InsertSubSwabAreaDto {
  @IsNotEmpty()
  swabAreaName!: string;
}
