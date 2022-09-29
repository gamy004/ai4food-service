import { IsNotEmpty, Validate } from 'class-validator';
import { Not } from 'typeorm';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { Unique } from '~/common/validators/unique-validator';
import { Product } from '../entities/product.entity';

export class CreateProductDto {
  @IsNotEmpty()
  @Validate(Unique, [
    Product,
    ({ object: { productCode } }: { object: Partial<Product> }) => ({
      productCode,
    }),
  ])
  productCode!: string;

  @IsNotEmpty()
  @Validate(Unique, [
    Product,
    ({ object: { alternateProductCode } }: { object: Partial<Product> }) => ({
      alternateProductCode,
    }),
  ])
  alternateProductCode!: string;

  @IsNotEmpty()
  @Validate(Unique, [
    Product,
    ({ object: { productName } }: { object: Partial<Product> }) => ({
      productName,
    }),
  ])
  productName!: string;
}
