import { Controller, ForbiddenException, Body, Param, Put } from '@nestjs/common';
import { SwabTestService } from '../services/swab-test.service';
import { BodyUpdateSwabTestDto, ParamUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { User } from '~/auth/entities/user.entity';

@Controller('swab-test')
export class SwabTestController {
  constructor(private readonly swabTestService: SwabTestService) { }

  @Authenticated()
  @Put(":id")
  async commandUpdateSwabTest(
    @AuthUser() user: User,
    @Param() paramCommandUpdateSwabPlanByIdDto: ParamUpdateSwabTestDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyUpdateSwabTestDto
  ) {

    try {
      await this.swabTestService.commandUpdateBacteriaSpecie(
        paramCommandUpdateSwabPlanByIdDto.id,
        { ...bodycommandUpdateSwabPlanByIdDto },
        user
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
