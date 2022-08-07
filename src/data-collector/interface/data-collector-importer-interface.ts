import { ImportTransaction } from "~/import-transaction/entities/import-transaction.entity"

export interface DataCollectorImporterInterface<Entity> {
    import(importTransaction: ImportTransaction, records: Entity[]): Promise<void>;
}