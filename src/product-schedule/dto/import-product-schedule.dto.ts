import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { ImportTransaction } from "~/import-transaction/entities/import-transaction.entity";
import { CreateProductScheduleDto } from "./create-product-schedule.dto";

// Object Values!! (Domain Layer)
export class ImportProductScheduleDto {
    importTransaction: ImportTransaction;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateProductScheduleDto)
    records: CreateProductScheduleDto[];
}
