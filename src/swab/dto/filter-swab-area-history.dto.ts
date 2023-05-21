import { IsOptional, IsUUID, Validate } from 'class-validator';
import { DateOnlyRule } from '~/common/validators/date-only-validator';
import { SwabAreaExistsRule } from '../validators/swab-area-exists-validator';
import { SwabAreaHistoryExistsRule } from '../validators/swab-area-history-exists-validator';
import { FilterHistoryDto } from './filter-history.dto';

export class FilterSwabAreaHistoryDto extends FilterHistoryDto {
  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaHistoryExistsRule)
  id?: string;

  @IsOptional()
  @Validate(DateOnlyRule)
  swabAreaDate?: string;

  @IsOptional()
  @IsUUID()
  @Validate(SwabAreaExistsRule)
  swabAreaId?: string;
}
