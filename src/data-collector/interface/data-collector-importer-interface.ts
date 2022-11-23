import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';

export interface DataCollectorImporterInterface<Entity> {
  setTimezone(timezone: string): void;
  getTimezone(): string;
  import(
    importTransaction: ImportTransaction,
    records: Entity[],
  ): Promise<void>;
}
