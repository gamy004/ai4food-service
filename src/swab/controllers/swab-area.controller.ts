import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { FindAllSwabAreaQuery } from '../dto/find-all-swab-area-query.dto';
import { CreateSwabAreaDto } from '../dto/create-swab-area.dto';
import {
  BodyUpdateSwabAreaDto,
  ParamUpdateSwabAreaDto,
} from '../dto/update-swab-area.dto';
import { SwabAreaService } from '../services/swab-area.service';
import {
  ParamGetSwabAreaDeletePermissionDto,
  ResponseGetSwabAreaDeletePermissionDto,
} from '../dto/get-swab-area-delete-permission.dto';

@Controller('swab/area')
@ApiTags('Swab')
export class SwabAreaController {
  constructor(private readonly swabAreaService: SwabAreaService) {}

  @Authenticated()
  @Get('main')
  findAllMainArea(@Query() query: FindAllSwabAreaQuery) {
    return this.swabAreaService.findAllMainArea(query);
  }

  @Authenticated()
  @Get(':id/delete-permission')
  getDeletePermission(
    @Param() param: ParamGetSwabAreaDeletePermissionDto,
  ): Promise<ResponseGetSwabAreaDeletePermissionDto> {
    return this.swabAreaService.getDeletePermission(param);
  }

  @Authenticated()
  @Post()
  createSwabArea(@Body() createSwabAreaDto: CreateSwabAreaDto) {
    return this.swabAreaService.createSwabArea(createSwabAreaDto);
  }

  @Authenticated()
  @Put(':id')
  async update(
    @Param() param: ParamUpdateSwabAreaDto,
    @Body() body: BodyUpdateSwabAreaDto,
  ) {
    return this.swabAreaService.updateSwabArea(param, body);
  }

  @Authenticated()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedSwabArea = await this.swabAreaService.findOne({
      where: { id },
      relations: {
        subSwabAreas: true,
        swabAreaHistories: true,
      },
      select: {
        subSwabAreas: {
          id: true,
        },
        swabAreaHistories: {
          id: true,
        },
      },
    });

    return this.swabAreaService.removeOne(deletedSwabArea);
  }
}
