import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomService } from '../services/room.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('room')
@ApiTags('Facility')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomService.find({
      relations: {
        zone: true,
        riskZone: true
      }
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOneByOrFail({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update({ id }, updateRoomDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const room = await this.roomService.findOneByOrFail({ id });

    return this.roomService.removeOne(room);
  }
}
