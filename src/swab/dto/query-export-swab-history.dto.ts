import { IntersectionType, PickType } from '@nestjs/swagger';
import { FilterHistoryDto } from './filter-history.dto';
import { FilterSwabAreaHistoryDto } from './filter-swab-area-history.dto';
import { FilterSwabProductHistoryDto } from './filter-swab-product-history.dto';

export class QueryExportSwabHistoryDto extends IntersectionType(
  FilterHistoryDto,
  IntersectionType(
    PickType(FilterSwabAreaHistoryDto, ['swabAreaId']),
    PickType(FilterSwabProductHistoryDto, ['productId']),
  ),
) {}
