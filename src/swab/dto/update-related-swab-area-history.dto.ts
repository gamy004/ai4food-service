import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { FilterSwabAreaHistoryDto } from './filter-swab-area-history.dto';

export class UpdateRelatedSwabAreaHistoryDto extends PickType(
  FilterSwabAreaHistoryDto,
  ['fromDate', 'toDate'],
) {
  @IsOptional()
  @IsNotEmpty()
  roundNumberSwabTest?: string;
}
