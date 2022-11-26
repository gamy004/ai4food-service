import { PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { IsNull, Not } from 'typeorm';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { Unique } from '~/common/validators/unique-validator';
import { Product } from '../entities/product.entity';
import { ConnectProductDto } from './connect-product.dto';

export class ParamUpdateProductDto extends PickType(ConnectProductDto, [
  'id',
]) {}

export class BodyUpdateProductDto extends ContextAwareDto {
  @IsNotEmpty()
  @Validate(Unique, [
    Product,
    ({
      object: { productCode, context },
    }: {
      object: Partial<Product> & ContextAwareDto;
    }) => ({
      productCode,
      id: Not(context.params.id),
      deletedAt: IsNull(),
    }),
  ])
  productCode!: string;

  @IsNotEmpty()
  @Validate(Unique, [
    Product,
    ({
      object: { alternateProductCode, context },
    }: {
      object: Partial<Product> & ContextAwareDto;
    }) => ({
      alternateProductCode,
      id: Not(context.params.id),
      deletedAt: IsNull(),
    }),
  ])
  alternateProductCode!: string;

  @IsNotEmpty()
  @Validate(Unique, [
    Product,
    ({
      object: { productName, context },
    }: {
      object: Partial<Product> & ContextAwareDto;
    }) => ({
      productName,
      id: Not(context.params.id),
      deletedAt: IsNull(),
    }),
  ])
  productName!: string;
}
