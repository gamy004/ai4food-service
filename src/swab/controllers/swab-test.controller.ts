import { Controller, ForbiddenException, Get, Post, Body, Patch, Param, Put, Delete } from '@nestjs/common';
import { SwabTestService } from '../services/swab-test.service';
import { BodyUpdateSwabTestDto, ParamUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';

@Controller('swab-test')
export class SwabTestController {
  constructor(private readonly swabTestService: SwabTestService) { }

  @Authenticated()
  @Put(":id")
  async commandUpdateSwabTest(
    @Param() paramCommandUpdateSwabPlanByIdDto: ParamUpdateSwabTestDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyUpdateSwabTestDto
  ) {

    try {
      await this.swabTestService.commandUpdateBacteriaSpecie(
        paramCommandUpdateSwabPlanByIdDto.id,
        bodycommandUpdateSwabPlanByIdDto
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update lab result success'
    };
  }
}
