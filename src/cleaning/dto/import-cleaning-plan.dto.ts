import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { ConnectFacilityItemDto } from '~/facility/dto/connect-facility-item.dto';
import { ConnectImportTransactionDto } from '~/import-transaction/dto/connect-import-transaction.dto';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { IsImportTypeRule } from '~/import-transaction/validators/is-import-type-validator';
import { ConnectCleaninProgramDto } from './connect-cleaning-program.dto';

export class ImportCleaningPlanRecordDto extends ContextAwareDto {
  @IsNotEmpty()
  cleaningPlanName: string;

  @Validate(DateOnlyRule)
  cleaningPlanDate: string;

  @ValidateNested()
  @Type(() => ConnectCleaninProgramDto)
  cleaningProgram: ConnectCleaninProgramDto;

  @ValidateNested()
  @Type(() => ConnectFacilityItemDto)
  facilityItem: ConnectFacilityItemDto;
}

// Object Values!! (Domain Layer)
export class ImportCleaningPlanDto {
  @Validate(IsImportTypeRule, [ImportType.CLEANING_PLAN])
  importTransaction: ConnectImportTransactionDto;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Validate(UniqueFieldRecordRule, ['cleaningPlanName'])
  @Type(() => ImportCleaningPlanRecordDto)
  records: ImportCleaningPlanRecordDto[];

  @IsOptional()
  timezone?: string;
}
