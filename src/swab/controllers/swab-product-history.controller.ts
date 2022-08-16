import { Controller, Get, Param, Query } from '@nestjs/common';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { ParamQuerySwabProductByIdDto } from '../dto/param-query-swab-product-by-id.dto';
import { QuerySwabProductDto } from '../dto/query-swab-product.dto';
import { SwabProductQueryService } from '../services/swab-product-query.service';

@Controller('swab/product-history')
export class SwabProductHistoryController {
  constructor(
    private readonly SwabProductQueryService: SwabProductQueryService,
  ) { }

  @Authenticated()
  @Get()
  querySwabProduct(@Query() querySwabProductDto: QuerySwabProductDto) {
    return this.SwabProductQueryService.querySwabProduct(querySwabProductDto);
  }

  @Authenticated()
  @Get(":id")
  querySwabProductById(@Param() paramQuerySwabProductByIdDto: ParamQuerySwabProductByIdDto) {
    return this.SwabProductQueryService.querySwabProductById(paramQuerySwabProductByIdDto.id);
  }
}
