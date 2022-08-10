import { Controller, Get, Query } from '@nestjs/common';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { QuerySwabProductDto } from '../dto/query-swab-product.dto';
import { SwabProductQueryService } from '../services/swab-product-query.service';

@Controller('swab/product-history')
export class SwabProductHistoryController {
  constructor(
    private readonly SwabProductQueryService: SwabProductQueryService,
  ) { }

  // @Authenticated()
  @Get("export")
  querySwabProduct(@Query() querySwabProductDto: QuerySwabProductDto) {
    return this.SwabProductQueryService.querySwabProduct(querySwabProductDto);
  }
}
