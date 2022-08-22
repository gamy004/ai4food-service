import { Controller, ForbiddenException, Body, Param, Put } from '@nestjs/common';
import { SwabLabManagerService } from '../services/swab-lab-manager.service';
import { BodyUpdateSwabTestDto, ParamUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { User } from '~/auth/entities/user.entity';

@Controller('swab-test')
export class SwabTestController {
  constructor(private readonly swabLabManagerService: SwabLabManagerService) { }

  @Authenticated()
  @Put(":id")
  async commandUpdateSwabTest(
    @AuthUser() user: User,
    @Param() paramUpdateSwabTestDto: ParamUpdateSwabTestDto,
    @Body() bodyUpdateSwabTestDto: BodyUpdateSwabTestDto
  ) {

    try {
      await this.swabLabManagerService.commandUpdateBacteriaSpecie(
        paramUpdateSwabTestDto.id,
        { ...bodyUpdateSwabTestDto },
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
