import { PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { Not } from 'typeorm';
import { ContextAwareDto } from '~/common/dto/context-aware.dto';
import { Unique } from '~/common/validators/unique-validator';
import { Product } from '../entities/product.entity';
import { ConnectProductDto } from './connect-product.dto';

export class ParamDeleteProductDto extends PickType(ConnectProductDto, [
  'id',
]) {}