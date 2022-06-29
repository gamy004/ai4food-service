import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { DataCollectorImporterInterface } from "~/data-collector/interface/data-collector-importer-interface";
import { ImportTransaction, ImportType } from "~/import-transaction/entities/import-transaction.entity";

// Policy!!! (Application Layer)
export abstract class DataCollectorImporter<Entity> implements DataCollectorImporterInterface<Entity> {
    constructor(
        private readonly repository: CommonRepositoryInterface<Entity>
    ) { }

    abstract importType: ImportType;

    async import(importTransaction: ImportTransaction, records: Entity[]): Promise<void> {
        if (importTransaction.importType !== this.importType) {
            throw new Error(`Importer accept only import transaction type ${this.importType}`);
        }

        const entities = records.map(entity => ({
            ...entity,
            importTransaction
        }));

        await this.repository.save(entities);
    }
}