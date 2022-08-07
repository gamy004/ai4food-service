import { InjectRepository } from "@nestjs/typeorm";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { CheckOutput, DataCollectorImporter } from "~/data-collector/data-collector.importer";
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

    async check(records: ProductSchedule[]): Promise<CheckOutput<ProductSchedule>> {
        const existRecords = await this.repository.findBy(
            records.map(
                ({ productScheduleDate, productScheduleStartedAt, productScheduleEndedAt }) => {
                    return {
                        productScheduleDate,
                        productScheduleStartedAt,
                        productScheduleEndedAt
                    };
                }
            )
        );

        console.log(1234, existRecords);

        return {
            // newRecords: [],
            existRecords
        };
    }
}