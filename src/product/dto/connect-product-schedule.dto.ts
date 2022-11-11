import { IsUUID, Validate } from 'class-validator';
import { ProductScheduleExistsRule } from '../validators/product-schedule-exists-validator';

export class ConnectProductScheduleDto {
  @IsUUID()
  @Validate(ProductScheduleExistsRule)
  id: string;
}
