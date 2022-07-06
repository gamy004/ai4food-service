import { IsEnum } from "class-validator";
import { ImportType } from "../entities/import-transaction.entity";

export class CreateImportTransactionDto {
    @IsEnum(ImportType)
    importType: ImportType;
}
