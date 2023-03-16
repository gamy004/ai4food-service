import { IsOptional, IsUUID, Validate } from 'class-validator';
import { ImportTransactionExistsRule } from '~/import-transaction/validators/import-transaction-exists-validator';

export class FilterSwabTestDto {
  @IsOptional()
  @IsUUID()
  @Validate(ImportTransactionExistsRule)
  importTransactionId?: string;
}
