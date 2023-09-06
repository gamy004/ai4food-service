import { IsUUID, Validate } from 'class-validator';
import { ImportTransactionExistsRule } from '../validators/import-transaction-exists-validator';

export class ConnectImportTransactionDto {
  @IsUUID()
  @Validate(ImportTransactionExistsRule)
  id: string;
}
