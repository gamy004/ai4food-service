import { PickType } from '@nestjs/swagger';
import { ConnectProductScheduleDto } from './connect-product-schedule.dto';

export class ParamDeleteProductScheduleDto extends PickType(
  ConnectProductScheduleDto,
  ['id'],
) {}
