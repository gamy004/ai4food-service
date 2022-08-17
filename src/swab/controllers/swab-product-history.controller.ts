import { Body, Controller, ForbiddenException, Get, Param, Put, Query } from '@nestjs/common';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { User } from '~/auth/entities/user.entity';
import { ParamCommandUpdateSwabProductByIdDto, BodyCommandUpdateSwabProductByIdDto } from '../dto/command-update-swab-product-history-by-id.dto';
import { ParamQuerySwabProductByIdDto } from '../dto/param-query-swab-product-by-id.dto';
import { QuerySwabProductDto } from '../dto/query-swab-product.dto';
import { SwabProductManagerService } from '../services/swab-product-manager.service';
import { SwabProductQueryService } from '../services/swab-product-query.service';

@Controller('swab/product-history')
export class SwabProductHistoryController {
  constructor(
    private readonly swabProductQueryService: SwabProductQueryService,
    private readonly swabProductManagerService: SwabProductManagerService
  ) { }

  @Authenticated()
  @Get()
  querySwabProduct(@Query() querySwabProductDto: QuerySwabProductDto) {
    return this.swabProductQueryService.querySwabProduct(querySwabProductDto);
  }

  @Authenticated()
  @Get(":id")
  querySwabProductById(@Param() paramQuerySwabProductByIdDto: ParamQuerySwabProductByIdDto) {
    return this.swabProductQueryService.querySwabProductById(paramQuerySwabProductByIdDto.id);
  }

  @Authenticated()
  @Put(":id")
  async commandUpdateSwabProductHistoryById(
    @AuthUser() user: User,
    @Param() param: ParamCommandUpdateSwabProductByIdDto,
    @Body() body: BodyCommandUpdateSwabProductByIdDto
  ) {

    try {
      await this.swabProductManagerService.commandUpdateSwabProductHistoryById(
        param.id,
        body,
        user
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update swab product success'
    };
  }
}
