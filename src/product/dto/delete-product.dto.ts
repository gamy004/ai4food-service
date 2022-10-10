import { PickType } from '@nestjs/swagger';
import { ConnectProductDto } from './connect-product.dto';

export class ParamDeleteProductDto extends PickType(ConnectProductDto, [
  'id',
]) {}
