import { Injectable } from '@nestjs/common';
import { CreateSwabDto } from '../dto/create-swab.dto';
import { UpdateSwabDto } from '../dto/update-swab.dto';

@Injectable()
export class SwabService {
  create(createSwabDto: CreateSwabDto) {
    return 'This action adds a new swab';
  }

  findAll() {
    return `This action returns all swab`;
  }

  findOne(id: number) {
    return `This action returns a #${id} swab`;
  }

  update(id: number, updateSwabDto: UpdateSwabDto) {
    return `This action updates a #${id} swab`;
  }

  remove(id: number) {
    return `This action removes a #${id} swab`;
  }
}
