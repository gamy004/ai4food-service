import { IsOptional, IsUUID, Validate } from 'class-validator';
import { ImportTransactionExistsRule } from '../validators/import-transaction-exists-validator';

export class ParamImportTransactionDto {
  @IsOptional()
  @IsUUID()
  @Validate(ImportTransactionExistsRule)
  id?: string;
}
