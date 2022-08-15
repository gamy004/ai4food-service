import { Controller, Get, Param, Body, ForbiddenException, Post, Put, Query } from '@nestjs/common';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { User } from '~/auth/entities/user.entity';
import { ParamCommandUpdateSwabPlanByIdDto, BodyCommandUpdateSwabPlanByIdDto } from '../dto/command-update-swab-plan-by-id.dto';
import { GenerateSwabPlanDto } from '../dto/generate-swab-plan.dto';
import { ParamLabSwabPlanByIdDto } from '../dto/param-lab-swab-plan-by-id.dto';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { SwabLabQueryService } from '../services/swab-lab-query.service';
import { SwabPlanManagerService } from '../services/swab-plan-manager.service';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';

@Controller('swab/area-history')
export class SwabAreaHistoryController {
  constructor(
    private readonly swabPlanQueryService: SwabPlanQueryService,
    private readonly swabPlanManagerService: SwabPlanManagerService,
    private readonly swabLabQueryService: SwabLabQueryService,
  ) { }

  @Authenticated()
  @Get()
  queryUpdateSwabPlan(@Query() queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlan(queryUpdateSwabPlanDto);
  }

  @Authenticated()
  @Get("export")
  querySwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabPlanQueryService.querySwabPlan(querySwabPlanDto);
  }

  @Authenticated()
  @Get("lab")
  queryLabSwabPlan(@Query() queryLabSwabPlanDto: QueryLabSwabPlanDto) {
    return this.swabLabQueryService.queryLabSwabPlan(queryLabSwabPlanDto);
  }

  @Authenticated()
  @Get(":id/lab")
  queryLabSwabPlanById(@Param() paramLabSwabPlanByIdDto: ParamLabSwabPlanByIdDto) {
    return this.swabLabQueryService.queryLabSwabPlanById(paramLabSwabPlanByIdDto);
  }

  @Authenticated()
  @Get(":id")
  queryUpdateSwabPlanById(@Param() queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlanById(queryUpdateSwabPlanByIdDto);
  }

  @Post()
  generateSwabPlan(@Query() generateSwabPlanDto: GenerateSwabPlanDto) {
    return this.swabPlanManagerService.generateSwabPlan(generateSwabPlanDto);
  }

  @Authenticated()
  @Put(":id")
  async commandUpdateSwabPlanById(
    @AuthUser() user: User,
    @Param() paramCommandUpdateSwabPlanByIdDto: ParamCommandUpdateSwabPlanByIdDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyCommandUpdateSwabPlanByIdDto
  ) {

    try {
      await this.swabPlanManagerService.commandUpdateSwabPlanById(
        paramCommandUpdateSwabPlanByIdDto.id,
        bodycommandUpdateSwabPlanByIdDto,
        user
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update swab plan success'
    };
  }
}
