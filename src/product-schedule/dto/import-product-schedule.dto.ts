import { ImportTransaction } from "~/import-transaction/entities/import-transaction.entity";
import { CreateProductScheduleDto } from "./create-product-schedule.dto";

// Object Values!! (Domain Layer)
export class ImportProductScheduleDto {
    importTransaction: ImportTransaction;

    records: CreateProductScheduleDto[];
}
