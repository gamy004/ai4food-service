import {
  Controller,
  ForbiddenException,
  Body,
  Param,
  Put,
} from '@nestjs/common';
import { SwabLabManagerService } from '../services/swab-lab-manager.service';
import {
  BodyUpdateSwabTestDto,
  ParamUpdateSwabTestDto,
} from '../dto/command-update-swab-test.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { User } from '~/auth/entities/user.entity';
import { CommandUpdateSwabTestBacteriaSpecieDto } from '../dto/command-update-swab-test-bacteria-specie.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('swab-test')
@ApiTags('Swab')
export class SwabTestController {
  constructor(private readonly swabLabManagerService: SwabLabManagerService) {}

  @Authenticated()
  @Put(':id')
  async commandUpdateSwabTest(
    @AuthUser() user: User,
    @Param() paramUpdateSwabTestDto: ParamUpdateSwabTestDto,
    @Body() bodyUpdateSwabTestDto: BodyUpdateSwabTestDto,
  ) {
    try {
      await this.swabLabManagerService.commandUpdateBacteria(
        paramUpdateSwabTestDto.id,
        { ...bodyUpdateSwabTestDto },
        user,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update lab result success',
    };
  }

  @Authenticated()
  @Put(':id/bacteria-specie')
  async commandUpdateSwabTestBacteriaSpecie(
    @AuthUser() user: User,
    @Param() paramUpdateSwabTestDto: ParamUpdateSwabTestDto,
    @Body() body: CommandUpdateSwabTestBacteriaSpecieDto,
  ) {
    let result;

    try {
      result = await this.swabLabManagerService.commandUpdateBacteriaSpecie(
        paramUpdateSwabTestDto.id,
        { ...body },
        user,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update bacteria specie success',
      result,
    };
  }
}
