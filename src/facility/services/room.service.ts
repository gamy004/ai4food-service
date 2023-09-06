import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { Room } from '../entities/room.entity';

@Injectable()
export class RoomService extends CrudService<Room> {
  constructor(
    @InjectRepository(Room)
    repository: CommonRepositoryInterface<Room>,
  ) {
    super(repository);
  }
}
