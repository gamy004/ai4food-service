// import { customAlphabet } from 'nanoid';
// import { alphanumeric } from 'nanoid-dictionary';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '~/common/services/abstract.crud.service';
import { UpdateImportTransactionDto } from '../dto/update-import-transaction.dto';
import {
  ImportStatus,
  ImportTransaction,
} from '../entities/import-transaction.entity';

@Injectable()
export class ImportTransactionService extends CrudService<ImportTransaction> {
  constructor(
    @InjectRepository(ImportTransaction)
    repository: Repository<ImportTransaction>,
  ) {
    super(repository);
  }

  /**
   * Complete the import transaction by changing import status to `success`
   * @param id id of the import transaction
   */
  async complete(id: string, body: UpdateImportTransactionDto): Promise<void> {
    this.repository.update(
      { id },
      { ...body, importStatus: ImportStatus.Success },
    );
  }

  /**
   * Cancel the import transaction by changing import status to `cancel`
   * @param id id of the import transaction
   */
  async cancel(id: string): Promise<void> {
    this.repository.update({ id }, { importStatus: ImportStatus.Cancel });
  }
}
