import { PartialType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ImportStatus } from '../entities/import-transaction.entity';
import { CreateImportTransactionDto } from './create-import-transaction.dto';

export class UpdateImportTransactionDto extends PartialType(CreateImportTransactionDto) {
    @IsEnum(ImportStatus)
    importStatus: ImportStatus;
}
