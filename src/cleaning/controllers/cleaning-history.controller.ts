import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { query } from 'express';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { User } from '~/auth/entities/user.entity';
import { QueryCleaningHistoryDto } from '../dto/query-cleaning-history.dto';
import {
  BodyUpdateCleaningHistoryDto,
  ParamFindCleaningHistoryByIdDto,
  ParamUpdateCleaningHistoryDto,
} from '../dto/update-cleaning-history.dto';
import { CleaningHistoryManagerService } from '../services/cleaning-history-manager.service';
import { CleaningHistoryQueryService } from '../services/cleaning-history-query.service';
import { CleaningHistoryService } from '../services/cleaning-history.service';

@Controller('cleaning-history')
@ApiTags('Cleaning')
export class CleaningHistoryController {
  constructor(
    private readonly cleaningHistoryService: CleaningHistoryService,
    private readonly cleaningHistoryQueryService: CleaningHistoryQueryService,
    private readonly cleaningHistoryManagerService: CleaningHistoryManagerService,
  ) {}

  @Get()
  async find(@Query() query: QueryCleaningHistoryDto) {
    return this.cleaningHistoryQueryService.queryByDto(query);
  }

  @Get(':id')
  async findById(@Param() param: ParamFindCleaningHistoryByIdDto) {
    return this.cleaningHistoryQueryService.queryById(param.id);
  }

  @Authenticated()
  @Put(':id')
  async update(
    @AuthUser() user: User,
    @Param() param: ParamUpdateCleaningHistoryDto,
    @Body() body: BodyUpdateCleaningHistoryDto,
  ) {
    const cleaningHistory = await this.cleaningHistoryService.findOne({
      where: { id: param.id },
      relations: {
        cleaningProgram: true,
        cleaningHistoryValidations: true,
      },
    });

    return this.cleaningHistoryManagerService.update(
      cleaningHistory,
      body,
      user,
    );
  }
}
