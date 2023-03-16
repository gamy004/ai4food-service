import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  Raw,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { FilterImportTransactionDto } from '../dto/filter-import-transaction.dto';
import { ResponseQueryImportTransactionDto } from '../dto/response-query-import-transaction.dto';
import { ImportTransaction } from '../entities/import-transaction.entity';

@Injectable()
export class ImportTransactionQueryService {
  constructor(
    private readonly dateTransformer: DateTransformer,
    @InjectRepository(ImportTransaction)
    private readonly repository: Repository<ImportTransaction>,
  ) {}

  toQuery(
    dto: FilterImportTransactionDto,
  ): SelectQueryBuilder<ImportTransaction> {
    let {
      id,
      fromDate,
      toDate,
      importType,
      importSource,
      skip,
      take,
      importedFileName,
      timezone = null,
    } = dto;

    const query = this.repository
      .createQueryBuilder('import_transaction')
      .leftJoinAndSelect('import_transaction.importedFile', 'imported_file')
      .where('import_transaction.id IS NOT NULL');

    if (id) {
      query.andWhere('import_transaction.id = :id', { id });
    }

    if (fromDate || toDate) {
      query.andWhere(
        this.dateTransformer.dateRangeToSql(
          'import_transaction.updatedAt',
          fromDate,
          toDate,
          { timezone, dateOnly: false },
        ),
      );
    }

    if (importType) {
      query.andWhere('import_transaction.importType = :importType', {
        importType,
      });
    }

    if (importSource) {
      query.andWhere('import_transaction.importSource = :importSource', {
        importSource,
      });
    }

    if (skip !== undefined) {
      query.skip(skip);
    }

    if (take !== undefined) {
      query.take(take);
    }

    if (importedFileName) {
      query.andWhere(
        'import_transaction.importedFileName = :importedFileName',
        {
          importedFileName,
        },
      );
    }

    return query;
  }

  async query(
    dto: FilterImportTransactionDto,
  ): Promise<ResponseQueryImportTransactionDto> {
    const query = this.toQuery(dto);

    const [importTransactions, total] = await query
      .orderBy('import_transaction.updatedAt', 'DESC')
      .getManyAndCount();

    return {
      total,
      importTransactions,
    };
  }
}
