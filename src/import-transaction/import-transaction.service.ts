import { Injectable } from '@nestjs/common';
import { CreateImportTransactionDto } from './dto/create-import-transaction.dto';
import { UpdateImportTransactionDto } from './dto/update-import-transaction.dto';

@Injectable()
export class ImportTransactionService {
  create(createImportTransactionDto: CreateImportTransactionDto) {
    return 'This action adds a new importTransaction';
  }

  findAll() {
    return `This action returns all importTransaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} importTransaction`;
  }

  update(id: number, updateImportTransactionDto: UpdateImportTransactionDto) {
    return `This action updates a #${id} importTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} importTransaction`;
  }
}
