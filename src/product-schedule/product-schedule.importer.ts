import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DataCollectorImporter } from "~/data-collector/data-collector.importer";
import { ImportType } from "~/import-transaction/entities/import-transaction.entity";
import { ProductSchedule } from "./entities/product-schedule.entity";

// Detail!!!
export class ProductScheduleImporter extends DataCollectorImporter<ProductSchedule> {
    importType: ImportType = ImportType.PRODUCTION_SCHEDULE;

    constructor(
        @InjectRepository(ProductSchedule)
        productScheduleRepository: Repository<ProductSchedule>
    ) {
        super(productScheduleRepository);
    }
}