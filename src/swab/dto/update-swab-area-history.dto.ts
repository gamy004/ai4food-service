import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Column } from 'typeorm';
import { Shift } from '~/common/enums/shift';
import { SwabEnvironment } from '../entities/swab-environment.entity';
import { CreateSwabAreaHistoryDto } from './create-swab-area-history.dto';

export class UpdateSwabAreaHistoryDto extends PartialType(
  CreateSwabAreaHistoryDto,
) {
  @IsNotEmpty()
  swabAreaDate: Date;

  @IsNotEmpty()
  swabAreaSwabedAt: Date;

  @IsOptional()
  @IsNotEmpty()
  swabAreaTemperature: number;

  @IsOptional()
  @IsNotEmpty()
  swabAreaHumidity?: number;

  @IsOptional()
  @IsNotEmpty()
  swabAreaAtp: number;

  @IsNotEmpty()
  swabPeriodId: string;

  @IsNotEmpty()
  swabAreaId: string;

  @IsNotEmpty()
  swabTestId: number;

  @IsNotEmpty()
  swabEnvironmentId: string;

  @IsNotEmpty()
  swabEnvironment: SwabEnvironment;

  @IsEnum(Shift)
  shift: Shift;
}
