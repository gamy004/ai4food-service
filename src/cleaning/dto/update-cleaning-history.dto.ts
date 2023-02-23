import { PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';
import { CleaningType } from '../entities/cleaning-history.entity';
import { CleaningHistoryCleaningValidationExistsRule } from '../validators/cleaning-history-cleaning-validation-exists-validator';
import { CleaningProgramExistsRule } from '../validators/cleaning-program-exists-validator';
import { CleaningValidationExistsRule } from '../validators/cleaning-validation-exists-validator';
import { ConnectCleaningHistoryDto } from './connect-cleaning-history.dto';

export class ParamFindCleaningHistoryByIdDto extends PickType(
  ConnectCleaningHistoryDto,
  ['id'],
) {}

export class ParamUpdateCleaningHistoryDto extends PickType(
  ConnectCleaningHistoryDto,
  ['id'],
) {}

export class BodyUpdateCleaningHistoryDto {
  @IsNotEmpty()
  @IsUUID()
  @Validate(CleaningProgramExistsRule)
  cleaningProgramId!: string;

  @IsNotEmpty()
  cleaningHistoryStartedAt!: Date;

  @IsNotEmpty()
  cleaningHistoryEndedAt!: Date;

  @IsEnum(CleaningType)
  cleaningType!: CleaningType;

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
  @Validate(CleaningHistoryCleaningValidationExistsRule)
  id?: string;

  @IsNotEmpty()
  @IsUUID()
  @Validate(CleaningValidationExistsRule)
  cleaningValidationId?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  pass!: boolean;
}
