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
import { IsNull } from 'typeorm';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { Unique } from '~/common/validators/unique-validator';
import { ConnectFacilityDto } from '~/facility/dto/connect-facility.dto';
import { SwabArea } from '../entities/swab-area.entity';
import { ConnectContactZoneDto } from '~/facility/dto/connect-contact-zone.dto';
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
      mainSwabAreaId: IsNull(),
      deletedAt: IsNull(),
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

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectContactZoneDto)
  contactZone?: ConnectContactZoneDto;
}

export class InsertSubSwabAreaDto {
  @IsNotEmpty()
  swabAreaName!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectContactZoneDto)
  contactZone?: ConnectContactZoneDto;
}
