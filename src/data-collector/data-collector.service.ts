import { Injectable } from '@nestjs/common';
// import { CreateDataCollectorDto } from './dto/create-import-transaction.dto';
// import { UpdateDataCollectorDto } from './dto/update-import-transaction.dto';

@Injectable()
export class DataCollectorService {
  // create(createDataCollectorDto: CreateDataCollectorDto) {
  //   return 'This action adds a new DataCollector';
  // }

  findAll() {
    return `This action returns all DataCollector`;
  }

  findOne(id: number) {
    return `This action returns a #${id} DataCollector`;
  }

  // update(id: number, updateDataCollectorDto: UpdateDataCollectorDto) {
  //   return `This action updates a #${id} DataCollector`;
  // }

  remove(id: number) {
    return `This action removes a #${id} DataCollector`;
  }

  /**
   * Confirm the import transaction as success transaction
   * @param id id of the import transaction
   */
  confirm(id: string) {}

  /**
   * Abort the import transaction, all related data will be hard deleted
   * @param id id of the import transaction
   */
  abort(id: string) {}
}
