import { Type } from "class-transformer";
import { IsNotEmpty, Validate, ValidateNested } from "class-validator";
import { UniqueFieldRecordRule } from "~/common/validators/unique-field-record-validator";
import { ConnectImportTransactionDto } from "~/import-transaction/dto/connect-import-transaction.dto";
import { ImportTransaction, ImportType } from "~/import-transaction/entities/import-transaction.entity";
import { IsImportTypeRule } from "~/import-transaction/validators/is-import-type-validator";
import { CreateProductScheduleDto } from "./create-product-schedule.dto";

// Object Values!! (Domain Layer)
export class ImportProductScheduleDto {
    @Validate(IsImportTypeRule, [ImportType.PRODUCT_SCHEDULE])
    importTransaction: ConnectImportTransactionDto;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Validate(
        UniqueFieldRecordRule,
        ['productScheduleDate', 'productScheduleStartedAt', 'productScheduleEndedAt']
    )
    @Type(() => CreateProductScheduleDto)
    records: CreateProductScheduleDto[];
}
