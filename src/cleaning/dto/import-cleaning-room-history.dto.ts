import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { Shift } from '~/common/enums/shift';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { TimeGreaterThanRule } from '~/common/validators/time-greater-than-validator';
import { TimeOnlyRule } from '~/common/validators/time-only-validator';
import { UniqueFieldRecordRule } from '~/common/validators/unique-field-record-validator';
import { ConnectRoomDto } from '~/facility/dto/connect-room.dto';
import { ConnectImportTransactionDto } from '~/import-transaction/dto/connect-import-transaction.dto';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { IsImportTypeRule } from '~/import-transaction/validators/is-import-type-validator';

export class ImportCleaningRoomHistoryRecordDto extends ContextAwareDto {
  @Validate(DateOnlyRule)
  cleaningRoomDate: string;

  @Validate(TimeOnlyRule)
  cleaningRoomStartedAt: string;

  @Validate(TimeOnlyRule)
  @Validate(TimeGreaterThanRule, ['cleaningRoomStartedAt'])
  cleaningRoomEndedAt: string;

  @ValidateNested()
  @Type(() => ConnectRoomDto)
  room: ConnectRoomDto;

  @IsNotEmpty()
  shift: Shift;
}

// Object Values!! (Domain Layer)
export class ImportCleaningRoomHistoryDto {
  @Validate(IsImportTypeRule, [ImportType.CLEANING_ROOM_HISTORY])
  importTransaction: ConnectImportTransactionDto;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Validate(UniqueFieldRecordRule, [
    'cleaningRoomDate',
    'cleaningRoomStartedAt',
    'cleaningRoomEndedAt',
    'room.id',
  ])
  @Type(() => ImportCleaningRoomHistoryRecordDto)
  records: ImportCleaningRoomHistoryRecordDto[];

  @IsOptional()
  timezone?: string;
}
