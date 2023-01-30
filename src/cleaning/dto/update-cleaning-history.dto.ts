import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';
import { CleaningHistoryCleaningValidation } from '../entities/cleaning-history-cleaning-validation.entity';
import { CleaningHistoryExistsRule } from '../validators/cleaning-history-exists-validator';
import { ConnectCleaningHistoryDto } from './connect-cleaning-history.dto';

export class ParamUpdateCleaningHistoryDto extends PickType(
  ConnectCleaningHistoryDto,
  ['id'],
) {}

export class BodyUpdateCleaningHistoryDto {
  @IsNotEmpty()
  cleaningProgramId!: string;

  @IsNotEmpty()
  cleaningHistoryStartedAt!: Date;

  @IsNotEmpty()
  cleaningHistoryEndedAt!: Date;

  @IsOptional()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CleaningHistoryValidationsDto)
  cleaningHistoryValidations: CleaningHistoryValidationsDto[];
}

export class CleaningHistoryValidationsDto {
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  pass!: boolean;
}
