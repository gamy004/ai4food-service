import {
  Controller,
  Get,
  Param,
  Body,
  ForbiddenException,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { User } from '~/auth/entities/user.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import {
  ParamCommandUpdateSwabPlanByIdDto,
  BodyCommandUpdateSwabPlanByIdDto,
} from '../dto/command-update-swab-plan-by-id.dto';
import { GenerateSwabPlanDto } from '../dto/generate-swab-plan.dto';
import { ParamLabSwabPlanByIdDto } from '../dto/param-lab-swab-plan-by-id.dto';
import { QueryLabSwabPlanDto } from '../dto/query-lab-swab-plan.dto';
import { QuerySwabPlanDto } from '../dto/query-swab-plan.dto';
import { QueryUpdateSwabPlanByIdDto } from '../dto/query-update-swab-plan-by-id.dto';
import { QueryUpdateSwabPlanV2Dto } from '../dto/query-update-swab-plan-v2.dto';
import { QueryUpdateSwabPlanDto } from '../dto/query-update-swab-plan.dto';
import { UpdateRelatedSwabAreaHistoryDto } from '../dto/update-related-swab-area-history.dto';
import { SwabAreaHistoryRelationManagerService } from '../services/swab-area-history-relation-manager.service';
import { SwabLabQueryService } from '../services/swab-lab-query.service';
import { SwabPlanManagerService } from '../services/swab-plan-manager.service';
import { SwabPlanQueryService } from '../services/swab-plan-query.service';

@Controller('swab/area-history')
@ApiTags('Swab')
export class SwabAreaHistoryController {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly swabPlanQueryService: SwabPlanQueryService,
    private readonly swabPlanManagerService: SwabPlanManagerService,
    private readonly swabLabQueryService: SwabLabQueryService,
    private readonly swabAreaHistoryRelationManagerService: SwabAreaHistoryRelationManagerService,
  ) {}

  @Authenticated()
  @Get()
  queryUpdateSwabPlan(@Query() queryUpdateSwabPlanDto: QueryUpdateSwabPlanDto) {
    return this.swabPlanQueryService.queryUpdateSwabPlan(
      queryUpdateSwabPlanDto,
    );
  }

  @Authenticated()
  @Get('v2')
  queryUpdateSwabPlanV2(
    @Query() queryUpdateSwabPlanV2Dto: QueryUpdateSwabPlanV2Dto,
  ) {
    return this.swabPlanQueryService.queryUpdateSwabPlanV2(
      queryUpdateSwabPlanV2Dto,
    );
  }

  @Authenticated()
  @Get('export')
  queryExportSwabPlan(@Query() querySwabPlanDto: QuerySwabPlanDto) {
    return this.swabPlanQueryService.queryExportSwabPlan(querySwabPlanDto);
  }

  @Authenticated()
  @Get('lab')
  queryLabSwabPlan(@Query() queryLabSwabPlanDto: QueryLabSwabPlanDto) {
    return this.swabLabQueryService.queryLabSwabPlan(queryLabSwabPlanDto);
  }

  // @Authenticated()
  // @Get(":id/lab")
  // queryLabSwabPlanById(@Param() paramLabSwabPlanByIdDto: ParamLabSwabPlanByIdDto) {
  //   return this.swabLabQueryService.queryLabSwabPlanById(paramLabSwabPlanByIdDto);
  // }

  @Authenticated()
  @Get(':id')
  queryUpdateSwabPlanById(
    @Param() queryUpdateSwabPlanByIdDto: QueryUpdateSwabPlanByIdDto,
  ) {
    return this.swabPlanQueryService.queryUpdateSwabPlanById(
      queryUpdateSwabPlanByIdDto,
    );
  }

  @Post()
  generateSwabPlan(@Query() generateSwabPlanDto: GenerateSwabPlanDto) {
    return this.swabPlanManagerService.generateSwabPlan(generateSwabPlanDto);
  }

  @Post('import-old-data')
  saveSwabPlan(@Body() data: Array<String>) {
    return this.swabPlanManagerService.saveSwabPlan(data);
  }

  @Post('update-related')
  async updateRelatedSwabAreaHistory(
    @Body() data: UpdateRelatedSwabAreaHistoryDto,
  ) {
    await this.transaction.execute(async () => {
      await this.swabAreaHistoryRelationManagerService.updateRelatedSwabAreaHistory(
        data,
        false,
      );
    });

    return {
      ok: true,
      message: 'update related swab area history success',
    };
  }

  @Authenticated()
  @Put(':id')
  async commandUpdateSwabPlanById(
    @AuthUser() user: User,
    @Param()
    paramCommandUpdateSwabPlanByIdDto: ParamCommandUpdateSwabPlanByIdDto,
    @Body() bodycommandUpdateSwabPlanByIdDto: BodyCommandUpdateSwabPlanByIdDto,
  ) {
    try {
      await this.swabPlanManagerService.commandUpdateSwabPlanById(
        paramCommandUpdateSwabPlanByIdDto.id,
        bodycommandUpdateSwabPlanByIdDto,
        user,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update swab plan success',
    };
  }
}
