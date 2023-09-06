import { IsUUID, Validate } from 'class-validator';
import { ProductExistsRule } from '../validators/product-exists-validator';

export class ConnectProductDto {
  @IsUUID()
  @Validate(ProductExistsRule)
  id: string;
}
