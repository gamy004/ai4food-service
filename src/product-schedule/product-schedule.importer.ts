import { InjectRepository } from "@nestjs/typeorm";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { DataCollectorImporter } from "~/data-collector/data-collector.importer";
import { ImportType } from "~/import-transaction/entities/import-transaction.entity";
import { ProductSchedule } from "./entities/product-schedule.entity";

// Detail!!! (Application Layer)
export class ProductScheduleImporter extends DataCollectorImporter<ProductSchedule> {
    importType: ImportType = ImportType.PRODUCT_SCHEDULE;

    constructor(
        @InjectRepository(ProductSchedule)
        productScheduleRepository: CommonRepositoryInterface<ProductSchedule>
    ) {
        super(productScheduleRepository);
    }
}