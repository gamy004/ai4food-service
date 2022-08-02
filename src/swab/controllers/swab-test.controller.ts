import { Controller, ForbiddenException, Get, Post, Body, Patch, Param, Put, Delete } from '@nestjs/common';
import { SwabTestService } from '../services/swab-test.service';
import { BodyUpdateSwabTestDto, ParamUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';

@Controller('swab-test')
export class SwabTestController {
  constructor(private readonly swabTestService: SwabTestService) { }

  @Put(":id/listeria-mono")
  async commandUpdateSwabTest(
    @Param() paramCommandUpdateSwabPlanByIdDto: ParamUpdateSwabTestDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyUpdateSwabTestDto
  ) {

    try {
      await this.swabTestService.commandUpdateSwabPlanById(
        paramCommandUpdateSwabPlanByIdDto.id,
        bodycommandUpdateSwabPlanByIdDto
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update listeria result success'
    };
  }
}
