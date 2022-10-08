import { PickType } from '@nestjs/swagger';
import { ConnectProductDto } from './connect-product.dto';

export class ParamGetProductDeletePermissionDto extends PickType(
  ConnectProductDto,
  ['id'],
) {}

export class ResponseGetProductDeletePermissionDto {
  canDelete: boolean;
  message: string;
  countSwabAreaHistories: number;
  countSwabProductHistories: number;
  countProductSchedules: number;
}
