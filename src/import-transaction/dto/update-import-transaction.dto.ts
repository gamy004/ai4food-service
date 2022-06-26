import { PartialType } from '@nestjs/swagger';
import { CreateImportTransactionDto } from './create-import-transaction.dto';

export class UpdateImportTransactionDto extends PartialType(CreateImportTransactionDto) {}
