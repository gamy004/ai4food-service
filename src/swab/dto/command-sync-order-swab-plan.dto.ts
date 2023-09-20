import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PayloadCommandSyncOrderSwabPlanDto {
  @Type(() => Number)
  @IsNumber()
  after?: number;
}
