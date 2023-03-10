import { IsOptional, IsUUID, Validate } from 'class-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';
import { SwabPeriodExistsRule } from '../validators/swab-period-exists-validator';

export class QuerySwabCleaningValidationDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabPeriodExistsRule)
  swabPeriodId?: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaExistsRule)
  swabAreaId?: string;
}
