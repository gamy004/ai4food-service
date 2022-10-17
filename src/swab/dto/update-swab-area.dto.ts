import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, Validate, ValidateNested } from 'class-validator';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { ConnectSwabAreaDto } from './connect-swab-area.dto';
import { Unique } from '~/common/validators/unique-validator';
import { SwabArea } from '../entities/swab-area.entity';
import { IsNull, Not } from 'typeorm';
import { Type } from 'class-transformer';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { ConnectFacilityDto } from '~/facility/dto/connect-facility.dto';
import { Facility } from '~/facility/entities/facility.entity';

export class ParamUpdateSwabAreaDto extends PickType(ConnectSwabAreaDto, [
    'id',
]) { }

export class BodyUpdateSwabAreaDto extends ContextAwareDto {
    @IsNotEmpty()
    @Validate(Unique, [
        SwabArea,
        ({
            object: { swabAreaName, facility, context },
        }: {
            object: Partial<SwabArea> & ContextAwareDto;
        }) => ({
            swabAreaName,
            facility,
            mainSwabAreaId: IsNull(),
            id: Not(context.params.id),
        }),
    ])
    swabAreaName!: string;

    @IsOptional()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => InsertSubSwabAreaDto)
    @Validate(UniqueFieldRecordRule, ['swabAreaName'])
    subSwabAreas?: InsertSubSwabAreaDto[];

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ConnectFacilityDto)
    facility!: Facility;
}

export class InsertSubSwabAreaDto {
    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    id!: string;

    @IsNotEmpty()
    swabAreaName!: string;
}
