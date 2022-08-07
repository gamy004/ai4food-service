import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { DataCollectorImporterInterface } from "~/data-collector/interface/data-collector-importer-interface";
import { ImportTransaction, ImportType } from "~/import-transaction/entities/import-transaction.entity";

// Policy!!! (Application Layer)
export type CheckOutput<E> = {
    // newRecords: E[],
    existRecords: E[]
}
export abstract class DataCollectorImporter<Entity> implements DataCollectorImporterInterface<Entity> {
    constructor(
        protected readonly repository: CommonRepositoryInterface<Entity>
    ) { }

    abstract importType: ImportType;

    /**
     * Method to check exist records, the exist records must be returned
     * 
     * @param records The new records that will be imported
     * 
     * @return Promise<CheckOutput<Entity>>
     */
    abstract check(records: Entity[]): Promise<CheckOutput<Entity>>;

    async import(importTransaction: ImportTransaction, records: Entity[]): Promise<void> {
        const entities = records.map(entity => ({
            ...entity,
            importTransaction
        }));

        const {
            // newRecords = [],
            existRecords = []
        } = await this.check(entities);

        if (existRecords.length) {
            this.repository.softRemove(existRecords);
        }
        // console.log(newRecords, existRecords);

        await this.repository.save(entities);
    }
}