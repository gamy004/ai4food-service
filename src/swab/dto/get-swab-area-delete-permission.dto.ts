import { PickType } from '@nestjs/swagger';
import { ConnectSwabAreaDto } from './connect-swab-area.dto';

export class ParamGetSwabAreaDeletePermissionDto extends PickType(
  ConnectSwabAreaDto,
  ['id'],
) {}

export class ResponseGetSwabAreaDeletePermissionDto {
  canDelete: boolean;
  message: string;
  countSwabAreaHistories: number;
}
