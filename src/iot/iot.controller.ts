import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IotService } from './iot.service';
import { CreateIotDto } from './dto/create-iot.dto';
import { UpdateIotDto } from './dto/update-iot.dto';

@Controller()
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @MessagePattern('createIot')
  create(@Payload() createIotDto: CreateIotDto) {
    return this.iotService.create(createIotDto);
  }

  @MessagePattern('findAllIot')
  findAll() {
    return this.iotService.findAll();
  }

  @MessagePattern('findOneIot')
  findOne(@Payload() id: number) {
    return this.iotService.findOne(id);
  }

  @MessagePattern('updateIot')
  update(@Payload() updateIotDto: UpdateIotDto) {
    return this.iotService.update(updateIotDto.id, updateIotDto);
  }

  @MessagePattern('removeIot')
  remove(@Payload() id: number) {
    return this.iotService.remove(id);
  }
}
