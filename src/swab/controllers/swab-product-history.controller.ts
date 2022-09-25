import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { User } from '~/auth/entities/user.entity';
import { BodyCommandCreateSwabProductByIdDto } from '../dto/command-create-swab-product-history.dto';
import {
  ParamCommandUpdateSwabProductByIdDto,
  BodyCommandUpdateSwabProductByIdDto,
} from '../dto/command-update-swab-product-history-by-id.dto';
import { GenerateSwabProductPlanDto } from '../dto/generate-swab-product-plan.dto';
import { ParamCommandDeleteSwabProductByIdDto } from '../dto/param-command-delete-swab-product-history-by-id.dto';
import { ParamQuerySwabProductByIdDto } from '../dto/param-query-swab-product-by-id.dto';
import { QueryLabSwabProductDto } from '../dto/query-lab-swab-product-dto';
import { QuerySwabProductDto } from '../dto/query-swab-product.dto';
import { SwabLabQueryService } from '../services/swab-lab-query.service';
import { SwabProductManagerService } from '../services/swab-product-manager.service';
import { SwabProductQueryService } from '../services/swab-product-query.service';

@Controller('swab/product-history')
export class SwabProductHistoryController {
  constructor(
    private readonly swabProductQueryService: SwabProductQueryService,
    private readonly swabProductManagerService: SwabProductManagerService,
    private readonly swabLabQueryService: SwabLabQueryService,
  ) {}

  @Authenticated()
  @Get()
  querySwabProduct(@Query() querySwabProductDto: QuerySwabProductDto) {
    return this.swabProductQueryService.querySwabProduct(querySwabProductDto);
  }

  @Authenticated()
  @Get('lab')
  queryLabSwabProduct(@Query() queryLabSwabProductDto: QueryLabSwabProductDto) {
    return this.swabLabQueryService.queryLabSwabProduct(queryLabSwabProductDto);
  }

  @Authenticated()
  @Get(':id')
  querySwabProductById(
    @Param() paramQuerySwabProductByIdDto: ParamQuerySwabProductByIdDto,
  ) {
    return this.swabProductQueryService.querySwabProductById(
      paramQuerySwabProductByIdDto.id,
    );
  }

  // @Post()
  // async commandCreateSwabProductHistoryById(
  //   @AuthUser() user: User,
  //   @Body() body: BodyCommandCreateSwabProductByIdDto,
  // ) {
  //   let res;
  //   try {
  //     res =
  //       await this.swabProductManagerService.commandCreateSwabProductHistory(
  //         body,
  //         user,
  //       );
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return {
  //     data: res,
  //     message: 'create swab product success',
  //   };
  // }

  @Post('plan')
  generateSwabProductPlan(
    @Body() generateSwabProductPlanDto: GenerateSwabProductPlanDto,
  ) {
    return this.swabProductManagerService.generateSwabProductPlan(
      generateSwabProductPlanDto,
    );
  }

  @Authenticated()
  @Put(':id')
  async commandUpdateSwabProductHistoryById(
    @AuthUser() user: User,
    @Param() param: ParamCommandUpdateSwabProductByIdDto,
    @Body() body: BodyCommandUpdateSwabProductByIdDto,
  ) {
    try {
      await this.swabProductManagerService.commandUpdateSwabProductHistoryById(
        param.id,
        body,
        user,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update swab product success',
    };
  }

  // @Authenticated()
  // @Delete(':id')
  // async commandDeleteSwabProductHistoryById(
  //   @Param() param: ParamCommandDeleteSwabProductByIdDto,
  // ) {
  //   try {
  //     await this.swabProductManagerService.commandDeleteSwabProductHistoryById(
  //       param.id,
  //     );
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return {
  //     ok: true,
  //     message: 'delete swab product success',
  //   };
  // }
}
